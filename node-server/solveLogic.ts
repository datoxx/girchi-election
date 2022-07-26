function flatMap<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => U[]
): U[] {
  return Array.prototype.concat(...array.map(callbackfn));
}
export type Voter = string;
export type Candidate = { candidate: string; percent: number };
export type PositionProposal = Array<Candidate>;
export type Weight = number; // integer
export type Vote = { order: Array<PositionProposal> } & Supporter;
export type VoteNE = {
  orderHead: PositionProposal;
  orderTail: Array<PositionProposal>;
} & Supporter;

export type Supporter = { voter: Voter; weight: Weight };
export type Supporters = Array<Supporter>;
export type CandidateWeighted = {
  // TODO add field stating how much was actually
  // spent for example ∑hen there is full consensus no weight is spent
  candidate: string;
  weight: Weight;
  supporters: Supporters;
};
export type Result = Array<CandidateWeighted>;

const removeWinner = (
  winnerCandidate: string,
  order: Array<PositionProposal>
): Array<PositionProposal> => {
  return order
    .map((pos) => pos.filter(({ candidate }) => candidate !== winnerCandidate))
    .filter((x) => x.length > 0);
};
const sortByWeight = (votes: Array<VoteNE>): Result => {
  const candidateWeights: Map<
    string,
    {
      weight: Weight;
      supporters: Array<{ voter: Voter; weight: Weight }>;
    }
  > = new Map();
  votes.forEach((vote: VoteNE) => {
    vote.orderHead.forEach(({ candidate, percent }) => {
      const current = candidateWeights.get(candidate) || {
        weight: 0,
        supporters: [],
      };
      const support = vote.weight * (percent / 100);
      candidateWeights.set(candidate, {
        weight: current.weight + support,
        supporters: current.supporters.concat({
          voter: vote.voter,
          weight: support,
        }),
      });
    });
  });
  const candidatesSorted = Array.from(candidateWeights.entries()).sort(
    (a, b) => {
      return b[1].weight - a[1].weight;
    }
  );
  return candidatesSorted.map(([candidate, { weight, supporters }]) => ({
    candidate,
    weight,
    supporters,
  }));
};

export type RoundRes =
  | {
      type: "FULL_CONSENSUS";
      winner: CandidateWeighted;
    }
  | {
      type: "NEW_WINNER";
      winner: CandidateWeighted;
      winnerOptimized: CandidateWeighted;
      winningWeightMultiplier: number;
      // nextVotes: Array<Vote>;
    }
  | {
      type: "SKIP";
    }
  | {
      type: "COLLISION";
      candidates: Array<CandidateWeighted>;
    };

function* solveOneRound(
  votes: Array<VoteNE>
): Generator<unknown, RoundRes, unknown> {
  const candidatesSorted = sortByWeight(votes);
  yield renderResult(candidatesSorted);

  if (candidatesSorted.length === 0) {
    // NOTE it means that in this round everyone had empty candidate
    // set, probably that should be restricted in UI
    return { type: "SKIP" } as RoundRes;
  } else if (candidatesSorted.length === 1) {
    // NOTE it means that in this round everyone had one candidate
    // only and because of this no weight will be spend
    const winner = candidatesSorted[0];
    return {
      type: "FULL_CONSENSUS",
      winner,
    } as RoundRes;
  } else {
    if (candidatesSorted[0].weight.toFixed(2) === candidatesSorted[1].weight.toFixed(2)) {
      return {
        type: "COLLISION",
        candidates: candidatesSorted,
      } as RoundRes;
    }
    const winner = candidatesSorted[0];

    // NOTE mainOpponents wouldn't return empty array as here
    // candidatesSorted.length is 2 or more so the main opponent exists
    const opponents = sortByWeight(
      votes.filter(
        (vote: VoteNE) =>
          vote.orderHead.find((x) => x.candidate === winner.candidate) ===
          undefined
      )
    );
    // TODO combine this and first case together
    if (opponents.length === 0) {
      return {
        type: "FULL_CONSENSUS",
        winner,
      } as RoundRes;
    }
    console.log(opponents);
    yield renderResult(opponents);
    const [mainOpponent] = opponents;

    const minimumWinningWeight = mainOpponent.weight + 1;
    const weightSpent = minimumWinningWeight / winner.weight;
    const winningWeightMultiplier = 1 - weightSpent;

    return {
      type: "NEW_WINNER",
      winner,
      winningWeightMultiplier,
      winnerOptimized: {
        candidate: winner.candidate,
        // TODO fix rounding issues
        supporters: winner.supporters.map((x) => ({
          voter: x.voter,
          weight: x.weight - x.weight * winningWeightMultiplier,
        })),
        weight: minimumWinningWeight,
      },
    } as RoundRes;
  }
}

// Array<Vote>, Result]
export function* solve(votes: Array<Vote>): Generator<unknown, void, unknown> {
  const totalResult: Result = [];
  let nextVotes: Array<Vote> = votes;
  const satisfiedVotes: Array<Vote> = [];
  do {
    const votesNE = flatMap(nextVotes, (vote) => {
      if (vote.order.length === 0) {
        satisfiedVotes.push(vote);
        return [];
      }
      const [orderHead, ...orderTail] = vote.order;
      return [{ orderHead, orderTail, voter: vote.voter, weight: vote.weight }];
    });
    if (votesNE.length === 0) {
      break;
    }
    yield renderVotes(nextVotes);
    const result = yield* solveOneRound(votesNE);
    switch (result.type) {
      case "FULL_CONSENSUS":
        yield renderCandidateWeighted(result.winner);
        nextVotes = votesNE.map((vote) => {
          return {
            order: removeWinner(result.winner.candidate, vote.orderTail),
            voter: vote.voter,
            weight: vote.weight,
          };
        });
        totalResult.push(result.winner);
        break;
      case "SKIP":
        nextVotes = votesNE.map((vote) => {
          return {
            order: vote.orderTail,
            voter: vote.voter,
            weight: vote.weight,
          };
        });
        break;
      case "NEW_WINNER":
        yield renderCandidateWeighted(
            result.winnerOptimized
          );
        nextVotes = votesNE.map((vote: VoteNE) => {
          const support = vote.orderHead.find(
            ({ candidate }) => candidate === result.winner.candidate
          );
          // TODO fix rounding issues probably by `x - 1`
          return {
            voter: vote.voter,
            weight:
              support !== undefined
                ? vote.weight -
                  vote.weight *
                    (support.percent / 100) *
                    (1 - result.winningWeightMultiplier)
                : vote.weight,
            order: removeWinner(
              result.winner.candidate,
              support !== undefined
                ? vote.orderTail
                : [vote.orderHead, ...vote.orderTail]
            ),
          };
        });
        totalResult.push(result.winnerOptimized);
        break;
      case "COLLISION":
        yield renderResult(result.candidates);
        yield renderResult(totalResult);
        yield renderVotes(satisfiedVotes);
        yield renderVotes(
            votesNE.map((vote) => {
              return {
                order: [vote.orderHead, ...vote.orderTail],
                voter: vote.voter,
                weight: vote.weight,
              };
            })
          );
        return;
    }
  } while (true);
  yield renderResult(totalResult);
  yield renderVotes(satisfiedVotes);
  // return [nextVotes, totalResult] as [Array<Vote>, Result];
}

const renderResult = (result: Result) =>result.map((x) => renderCandidateWeighted(x));
const renderCandidateWeighted = (candidateWeighted: CandidateWeighted) => 
    ({ 
      candidate: candidateWeighted.candidate, 
      weight: candidateWeighted.weight.toFixed(2),
      supporters: candidateWeighted.supporters.map((supporter: Supporter) => 
      ({voter: supporter.voter, weight: supporter.weight.toFixed(2)}))  
    });
const renderVotes = (votes: Array<Vote>) => votes.map((x) => renderVoter(x));

const renderVoter = (vote: Vote) =>({
     voter: vote.voter,
     weight: vote.weight.toFixed(2),
     order: vote.order.map((x) => x.map((y) => ({candidate: y.candidate, percent: y.percent})))
    })