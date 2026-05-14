import type { SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { author } from "./author";

export const schemaTypes: SchemaTypeDefinition[] = [post, author];
