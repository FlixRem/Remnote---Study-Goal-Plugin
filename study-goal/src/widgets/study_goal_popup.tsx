import {
  AppEvents,
  renderWidget,
  usePlugin,
  useSessionStorageState,
  useTrackerPlugin,
  useAPIEventListener,
  WidgetLocation,
} from "@remnote/plugin-sdk";

const CARDS_KEY = "studyGoal_seenCards";
const MESSAGE_SETTING = "studyGoalMessage";

function StudyGoalPopup() {
  const plugin = usePlugin();

  const [seenCards] = useSessionStorageState<number>(CARDS_KEY, 0);

  const message = useTrackerPlugin(
    async (rp) =>
      (await rp.settings.getSetting<string>(MESSAGE_SETTING)) ||
      "You're done!!! nice!",
    []
  );

  const closeSelf = async () => {
    const { floatingWidgetId } =
      await plugin.widget.getWidgetContext<WidgetLocation.FloatingWidget>();
    await plugin.window.closeFloatingWidget(floatingWidgetId);
  };

  // Auto-close the popup as soon as the next card is completed,
  // so it doesn't get in the way of studying.
  useAPIEventListener(AppEvents.QueueCompleteCard, undefined, async () => {
    await closeSelf();
  });

  return (
    <div
      onClick={closeSelf}
      className="cursor-pointer rounded-xl border border-solid p-4 text-center shadow-lg rn-clr-background-primary rn-clr-content-primary"
    >
      <div className="text-4xl mb-2">🎉</div>
      <div className="text-xl font-bold mb-1">
        {message ?? "You're done!!! nice!"}
      </div>
      <div className="text-sm opacity-70">
        {seenCards} cards done — goal reached!
      </div>
      <div className="mt-3 text-xs opacity-50">(click to dismiss)</div>
    </div>
  );
}

renderWidget(StudyGoalPopup);
