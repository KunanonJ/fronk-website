import type { SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { author } from "./author";
import {
  cta,
  navItem,
  portableBody,
  resumeTimelineItem,
  resumeTimelineSection,
  seo,
} from "./objects";
import { homePage } from "./homePage";
import { resumeProfile } from "./resumeProfile";
import { siteSettings } from "./siteSettings";
import { standardPage } from "./standardPage";
import { venture } from "./venture";
import { writingPage } from "./writingPage";

export const schemaTypes: SchemaTypeDefinition[] = [
  cta,
  navItem,
  portableBody,
  resumeTimelineItem,
  resumeTimelineSection,
  seo,
  author,
  homePage,
  post,
  resumeProfile,
  siteSettings,
  standardPage,
  venture,
  writingPage,
];
