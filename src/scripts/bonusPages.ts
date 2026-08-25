export interface BonusPage {
  title: string;
  href: string;
}

// Practical add-ons applying the course's principles to a specific
// situation - a tool an organisation has rolled out (Copilot), or a role
// (operationalising this at an organisational level) - rather than a
// lifecycle stage everyone works through. Kept out of the main numbered
// grid because they're optional and situational, not sequential - but
// they assume the reader already knows the principles they're applying,
// so they only make sense *after* the core seven stages, not instead of
// or before them.
//
// Shared by index.astro (surfaces them for discoverability, so someone
// scanning the course upfront can see they exist) and conclusion.astro
// (the actual right moment to point at them: right when someone's
// finished the seven stages these pages assume). One array, so adding a
// page here (Gemini, ChatGPT Enterprise, Claude for Work, a builder- or
// user-specific deep dive, ...) updates both places at once rather than
// risking them drifting out of sync.
export const bonusPages: BonusPage[] = [
  { title: 'Using Copilot Responsibly', href: '/using-copilot-responsibly/' },
  { title: 'Operationalising Responsible AI', href: '/operationalising-responsible-ai/' },
];
