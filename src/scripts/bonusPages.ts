export interface BonusPage {
  title: string;
  href: string;
}

// Tool-specific practical add-ons applying the course's principles to one
// specific AI assistant an organisation has actually rolled out. Not
// lifecycle stages, so kept out of the main numbered grid - but they
// assume the reader already knows the principles they're applying, so
// they only make sense *after* the core seven stages, not instead of or
// before them.
//
// Shared by index.astro (surfaces them for discoverability, so someone
// scanning the course upfront can see they exist) and conclusion.astro
// (the actual right moment to point at them: right when someone's
// finished the seven stages these pages assume). One array, so adding a
// page here (Gemini, ChatGPT Enterprise, Claude for Work, ...) updates
// both places at once rather than risking them drifting out of sync.
export const bonusPages: BonusPage[] = [
  { title: 'Using Copilot Responsibly', href: '/using-copilot-responsibly/' },
];
