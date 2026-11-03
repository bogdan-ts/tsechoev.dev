import { countries } from "../../lib/profile";

export function TravelCommand() {
  return (
    <>
      <h2>Travel</h2>
      <ul>
        {countries.map(({ code, name }) => <li key={code}>{name}</li>)}
      </ul>
    </>
  );
}
