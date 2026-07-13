import {
  WidgetLocation,
  AppEvents,
  RNPlugin,
  declareIndexPlugin,
  ReactRNPlugin,
} from "@remnote/plugin-sdk";
import "../style.css";

// Session storage keys shared between the index plugin and the widgets.
const CARDS_KEY = "studyGoal_seenCards"; // number of cards pressed this session
const DONE_KEY = "studyGoal_goalReached"; // whether the goal popup was already shown

// Setting ids
const GOAL_SETTING = "studyGoalCount";
const MESSAGE_SETTING = "studyGoalMessage";

async function showCelebration(plugin: RNPlugin) {
  // Open a floating popup near the show-answer button area of the queue.
  // The small setTimeout in the caller makes sure the queue has rendered.
  await plugin.window.openFloatingWidget(
    "study_goal_popup",
    { top: -180, left: 0 },
    "rn-queue__show-answer-btn"
  );
}

async function onActivate(plugin: ReactRNPlugin) {
  // Initialize session state (resets every time the plugin loads / app reloads).
  await plugin.storage.setSession(CARDS_KEY, 0);
  await plugin.storage.setSession(DONE_KEY, false);

  // --- Settings (editable in the plugin settings) ---
  await plugin.settings.registerNumberSetting({
    id: GOAL_SETTING,
    title: "Study goal (number of cards)",
    description:
      "How many cards you want to press before you get the celebration message.",
    defaultValue: 120,
  });

  await plugin.settings.registerStringSetting({
    id: MESSAGE_SETTING,
    title: "Celebration message",
    description: "The message shown once you reach your study goal.",
    defaultValue: "You're done!!! nice!",
  });

  // --- Count each pressed card ---
  plugin.event.addListener(AppEvents.QueueCompleteCard, undefined, async () => {
    const goal = Math.max(
      1,
      Number((await plugin.settings.getSetting<number>(GOAL_SETTING)) || 120)
    );

    const seenCards =
      ((await plugin.storage.getSession<number>(CARDS_KEY)) || 0) + 1;
    await plugin.storage.setSession(CARDS_KEY, seenCards);

    const alreadyDone =
      (await plugin.storage.getSession<boolean>(DONE_KEY)) || false;

    // Fire the celebration exactly once, when we hit (or pass) the goal.
    if (!alreadyDone && seenCards >= goal) {
      await plugin.storage.setSession(DONE_KEY, true);
      setTimeout(() => {
        showCelebration(plugin);
      }, 25);
    }
  });

  // --- Reset the counter each time the user enters the queue ---
  plugin.event.addListener(AppEvents.QueueEnter, undefined, async () => {
    await plugin.storage.setSession(CARDS_KEY, 0);
    await plugin.storage.setSession(DONE_KEY, false);
  });

  // Manual test command so you can preview the celebration popup.
  await plugin.app.registerCommand({
    id: "showStudyGoalCelebration",
    name: "Show Study Goal Celebration",
    action: () => showCelebration(plugin),
  });

  // --- Widgets ---
  // Always-visible progress badge in the queue toolbar (top of the queue).
  // The badge content is right-aligned so it sits in the top-right corner.
  await plugin.app.registerWidget(
    "study_goal_badge",
    WidgetLocation.QueueToolbar,
    {
      dimensions: { height: "auto", width: "100%" },
    }
  );

  // Floating celebration popup shown when the goal is reached.
  await plugin.app.registerWidget(
    "study_goal_popup",
    WidgetLocation.FloatingWidget,
    {
      dimensions: { width: 300, height: "auto" },
    }
  );
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
