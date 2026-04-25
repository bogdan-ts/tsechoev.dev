import "./styles.css";
import { profile } from "./profile";
import { renderProfile } from "./render";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root was not found.");
}

app.innerHTML = renderProfile(profile);
