Timer must be repeatable without user interaction. That means if a user puts a maxTicks of 5, after the elapsed time has ended, the timer should be restarted automatically.

If the user manually restarts the timer, the timer must return to the initial state but continue running.

If the user exists the timer, the timer must destroy all data related to it and return to initial state. If the user restarts the timer, the timer goes from the beginning like the exit never happened.

Restart and quit should be done with callbacks returned from the hook, not state updates.

All non function properties must be static and not subject to state updates from client code.

Argument functions:

onExit() -> called when timer is stopped and returned to its inital state.
onTick() -> called on a single elapsed tick. For example, if interval is 1000 milliseconds, onTick will be called every 1000 milliseconds.
onElapsed() -> called when a maxTicks has been reached. This function must return the hook to its initial state but repeat the timer again.
onRestart() -> called when restart() is explicitly called from client code.
Static properties:

maxTicks: int (immutable): Maximum number of ticks (int) when reached, the timer restarts itself. This is not a number of seconds but a value of max elapsed timers. For example, if interval is 500 milliseconds while maxTicks is 6, the timer will restart itself after 3000 milliseconds (500 x 6).
interval: int (immutable): interval in milliseconds. This values would be passed to setInterval().
updateProps(interval: number, maxTicks: number) -> Updates interval and maxTicks. Client code must first exit the currently running timer, call updateProps() and then restart the timer with updated values.
Return values:

restart(): void -> restarts the timer but does not exit.
exit(): void -> exists the timer and returns to its initial state (but without the timer running).
current(): int -> returns the current elapsed time of the timer
info() -> return the info of the timer. This info is for the total duration of the timer regardless if it was restarted or exited. It is valid for the current browser session i.e. until the user refreshes the page. 