import { useCallback, useState, type KeyboardEvent } from "react";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import { Stack, Flex, Card, Box, Text, Button, TextInput } from "@sanity/ui";
import { POST_TAGS } from "../schemaTypes/postTags";

/**
 * Tag input for posts: free-type any tag AND pick from the preset POST_TAGS list.
 * Stores plain strings (no data-model change), so queries/types stay as-is.
 * - Selected tags render as removable chips.
 * - The text field offers POST_TAGS as a native datalist (type-ahead) and accepts
 *   arbitrary values on Enter / comma.
 * - Unused presets show as one-click "add" buttons, so the options are always visible.
 */
export function TagInput(props: ArrayOfPrimitivesInputProps) {
  const { value, onChange, elementProps } = props;
  const tags = (value as string[] | undefined) ?? [];
  const [draft, setDraft] = useState("");

  const commit = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      setDraft("");
      if (!tag || tags.includes(tag)) return;
      onChange(set([...tags, tag]));
    },
    [tags, onChange],
  );

  const remove = useCallback(
    (tag: string) => {
      const next = tags.filter((t) => t !== tag);
      onChange(next.length ? set(next) : unset());
    },
    [tags, onChange],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && tags.length > 0) {
      remove(tags[tags.length - 1]);
    }
  };

  const available = POST_TAGS.filter((t) => !tags.includes(t));

  return (
    <Stack space={3}>
      {tags.length > 0 && (
        <Flex gap={2} wrap="wrap">
          {tags.map((tag) => (
            <Card key={tag} padding={1} radius={2} tone="primary" border>
              <Flex align="center" gap={1}>
                <Box paddingX={2}>
                  <Text size={1}>{tag}</Text>
                </Box>
                <Button
                  mode="bleed"
                  padding={1}
                  fontSize={1}
                  text="✕"
                  aria-label={`Remove ${tag}`}
                  onClick={() => remove(tag)}
                />
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      <TextInput
        {...elementProps}
        value={draft}
        placeholder="Type a tag and press Enter, or pick one below…"
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={onKeyDown}
        list="post-tag-suggestions"
      />
      <datalist id="post-tag-suggestions">
        {available.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>

      {available.length > 0 && (
        <Flex gap={2} wrap="wrap">
          {available.map((tag) => (
            <Button
              key={tag}
              mode="ghost"
              padding={2}
              fontSize={1}
              text={tag}
              onClick={() => commit(tag)}
            />
          ))}
        </Flex>
      )}
    </Stack>
  );
}
