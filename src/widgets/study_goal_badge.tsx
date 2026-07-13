import {
  renderWidget,
  usePlugin,
  useSessionStorageState,
  useTrackerPlugin,
} from "@remnote/plugin-sdk";

const CARDS_KEY = "studyGoal_seenCards";
const GOAL_SETTING = "studyGoalCount";
const MESSAGE_SETTING = "studyGoalMessage";

function StudyGoalBadge() {
  const plugin = usePlugin();

  // Live count of pressed cards this session.
  const [seenCards] = useSessionStorageState<number>(CARDS_KEY, 0);

  // React to the settings so the badge updates immediately when they change.
  const goal = useTrackerPlugin(
    async (rp) =>
      Math.max(1, Number((await rp.settings.getSetting<number>(GOAL_SETTING)) || 120)),
    []
  );

  const message = useTrackerPlugin(
    async (rp) =>
      (await rp.settings.getSetting<string>(MESSAGE_SETTING)) ||
      "You're done!!! nice!",
    []
  );

  const goalValue = goal ?? 120;
  const done = seenCards >= goalValue;
  const remaining = Math.max(0, goalValue - seenCards);
  const pct = Math.min(100, Math.round((seenCards / goalValue) * 100));

  return (
    // Full width strip; content pushed to the right => top-right corner of the queue.
    <div className="w-full flex justify-end px-2 py-1">
      <div
        title={
          done
            ? message
            : `${remaining} card${remaining === 1 ? "" : "s"} to go`
        }
        className="flex items-center gap-2 rounded-full border border-solid rn-clr-background-primary rn-clr-content-primary shadow-sm px-3 py-1 text-sm select-none"
      >
        <span>{done ? "🎉" : "🎯"}</span>
        <span className="font-medium tabular-nums">
          {seenCards} / {goalValue}
        </span>
        {/* Mini progress bar */}
        <span className="hidden sm:inline-block w-16 h-1.5 rounded-full bg-gray-300/60 overflow-hidden">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: done ? "#22c55e" : "#3b82f6",
            }}
          />
        </span>
        {done && (
          <span className="font-semibold" style={{ color: "#22c55e" }}>
            done!
          </span>
        )}
      </div>
    </div>
  );
}

renderWidget(StudyGoalBadge);
