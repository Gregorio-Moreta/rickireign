// Preset tag suggestions for posts. Editors can pick these from the custom tag
// input (TagInput) or free-type their own. Kept here (not in post.ts) so both the
// schema and the input component can import it without a circular dependency.
// Add a suggestion by appending here, then `npm run schema:deploy` + redeploy.
export const POST_TAGS = [
  "Essay",
  "Note",
  "Somatic Leadership",
  "Ancestral Wisdom",
  "Organizational Leadership",
  "Practice",
  "Community",
  "Ritual & Rest",
] as const;
