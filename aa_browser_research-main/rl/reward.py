class HeuristicReward:
    """
    Hand‑crafted scalar reward.

      +1.0  episode finished AND cart JSON detected
      +0.2  macro successfully added a product
      +0.1  low‑level Add / Increase succeeded
     −0.01  time penalty every step
    """

    def score(self, tool_output: str, done: bool) -> float:
        lo = tool_output.lower()
        if done and '"final cart total"' in lo:
            return 1.0
        if '"macro_added"' in lo:
            return 0.2
        if '"action":"clicked"' in lo or '"action":"increased"' in lo:
            return 0.1
        return -0.01
