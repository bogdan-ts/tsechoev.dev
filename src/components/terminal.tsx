"use client";

import { useTerminal } from "../hooks/use-terminal";
import { Output } from "./output";
import { PromptPrefix } from "./prompt-prefix";
import { Welcome } from "./welcome";

export function Terminal() {
  const {
    input,
    entries,
    cursor,
    theme,
    focusPrompt,
    screenRef,
    showWelcome,
    run,
    latestEntryRef,
    submit,
    inputRef,
    changeInput,
    keyDown,
    startComposition,
    endComposition,
    syncCursor,
    suggestions,
    status,
  } = useTerminal();

  return (
    <main className="workspace" data-theme={theme} onClick={focusPrompt}>
      <section className="terminal-window" aria-label="Interactive portfolio terminal">
        <div className="terminal-body">
          <div
            className="terminal-screen"
            ref={screenRef}
            role="region"
            aria-label="Command output"
            tabIndex={0}
          >
            {showWelcome && <Welcome onCommand={run} />}
            {entries.map((entry, index) => (
              <div
                className="transcript-entry"
                key={entry.id}
                ref={index === entries.length - 1 ? latestEntryRef : undefined}
              >
                <p className="executed-command">
                  <PromptPrefix /> <span>{entry.input}</span>
                </p>
                {entry.result && (
                  <div className="command-output">
                    <Output result={entry.result} onCommand={run} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="prompt" onSubmit={submit}>
            <label htmlFor="command" className="prompt-prefix">
              <PromptPrefix />
              <span className="sr-only"> Enter a portfolio command</span>
            </label>
            <div className="command-input">
              <input
                id="command"
                ref={inputRef}
                value={input}
                onChange={changeInput}
                onKeyDown={keyDown}
                onCompositionStart={startComposition}
                onCompositionEnd={endComposition}
                onSelect={syncCursor}
                onScroll={syncCursor}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                maxLength={500}
              />
              <span
                className="cursor-track"
                aria-hidden="true"
                data-selected={cursor.selected}
                style={{ transform: `translate(${-cursor.scrollLeft}px, -50%)` }}
              >
                <span className="cursor-offset">{input.slice(0, cursor.offset)}</span>
                <span className="block-cursor" />
              </span>
            </div>
            <button className="enter-button" type="submit" aria-label="Run command">
              ↵
            </button>
          </form>
          {suggestions.length > 0 && (
            <p className="completions" aria-label="Command completions">
              {suggestions.join("   ")}
            </p>
          )}
          <p className="sr-only" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </section>
    </main>
  );
}
