import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Writing")
        .child(
          S.list()
            .title("Writing")
            .items([
              S.documentTypeListItem("post").title("Posts"),
              S.documentTypeListItem("author").title("Authors"),
              S.listItem()
                .title("Writing page")
                .child(
                  S.document()
                    .schemaType("writingPage")
                    .documentId("writingPage"),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Site")
        .child(
          S.list()
            .title("Site")
            .items([
              S.listItem()
                .title("Site settings")
                .child(
                  S.document()
                    .schemaType("siteSettings")
                    .documentId("siteSettings"),
                ),
              S.listItem()
                .title("Home page")
                .child(
                  S.document().schemaType("homePage").documentId("homePage"),
                ),
              S.listItem()
                .title("Resume profile")
                .child(
                  S.document()
                    .schemaType("resumeProfile")
                    .documentId("resumeProfile"),
                ),
            ]),
        ),
      S.documentTypeListItem("standardPage").title("Pages"),
      S.documentTypeListItem("venture").title("Ventures"),
    ]);
