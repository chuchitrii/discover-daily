import { Static, Type } from "@sinclair/typebox";

export const topArtistTerms: Array<TopArtistsTerms> = ['short_term', 'medium_term', 'long_term'];
export type TopArtistsTerms = 'short_term'| 'medium_term'| 'long_term'
export const TopArtistsRequestSchema = Type.Object({
  time_range: Type.Union([
    Type.Undefined(),
    ...topArtistTerms.map((time_range) => Type.Literal(time_range))
  ]),
  limit: Type.Number(),
  offset: Type.Number()
});
export type TopArtistsRequest = Static<typeof TopArtistsRequestSchema>;

const artistObjectFullImagesSchema = Type.Object({
  height: Type.Optional(Type.Number()),
  width: Type.Optional(Type.Number()),
  url: Type.String(),
})
const artistObjectFullSchema = Type.Object({
  name: Type.String(),
  id: Type.String(),
  genres: Type.Array(Type.String()),
  images: Type.Array(artistObjectFullImagesSchema)
})
export const topArtistsForAllTermsResponseSchema = Type.Object({
    short_term: Type.Array(artistObjectFullSchema),
    medium_term: Type.Array(artistObjectFullSchema),
    long_term: Type.Array(artistObjectFullSchema),
});
export type TopArtistsForAllTerms = Static<typeof topArtistsForAllTermsResponseSchema>
export type ArtistObjectFull = Static<typeof artistObjectFullSchema>
