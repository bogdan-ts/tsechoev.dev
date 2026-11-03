import { countries } from "../../lib/profile";

export function TravelCommand() {
  return (
    <>
      <h2>Travel</h2>
      {countries.length > 0 ? (
        <ul>
          {countries.map(({ code, name, note }) => (
            <li key={code}>{name}{note ? `: ${note}` : ""}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">I haven’t added my country list yet.</p>
      )}
    </>
  );
}
