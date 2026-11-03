import { profile } from "../../lib/profile";

export function CvCommand() {
  return (
    <>
      <h2>CV</h2>
      <a className="download-link" href={profile.resumeHref} download="Bogdan-Tsechoev-CV.pdf">
        ↓ Download CV <span>PDF</span>
      </a>
    </>
  );
}
