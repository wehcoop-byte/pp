import styleRoyal from "../assets/style_royal.png";
import styleImpressionist from "../assets/style_impressionist.png";
import styleWatercolor from "../assets/style_watercolor.png";
import StylePopart from "../assets/style_popart.png";
import styleSurrealist from "../assets/style_surrealist.png";
import stylePencil from "../assets/style_pencil.png";
import styleFantasy from "../assets/style_fantasy.png";
export interface Style {
  id: string;
  name: string;
  prompt: string;
  thumbnailUrl?: string;   // make optional so missing thumbs don't explode
  description?: string;    // used in the UI subtext
  isNew?: boolean;         // lets the selector show a "NEW" badge
}


export const STYLES: Style[] = [
  {
    id: "royal",
    name: "Royal Portrait",
    prompt: `
      Task:
      Convert the uploaded photo of my pet into a Renaissance-era regal oil painting portrait.

      CRITICAL PRIORITY:
      Maintain the exact and recognizable likeness of the pet.
      Every unique feature — the specific shape of the eyes, the pattern of the fur,
      the set of the mouth, and its individual expression — must be captured with precision.
      The pet's face and features should look exactly like the photo,
      simply rendered in an authentic Renaissance oil painting style.

      Style:
      Master-level, formal Renaissance portraiture.
      Dramatic chiaroscuro lighting, rich deep colors,
      and meticulous attention to detail in fur or feather texture.
      Brushwork should be smooth and blended, minimizing visible strokes on the pet itself.

      Scene:
      The pet is posed regally in an opulent chamber with dark, ornate wooden paneling
      or heavy velvet drapes in deep jewel tones (maroon, emerald, sapphire).
      A subtle golden light from the upper left illuminates the pet’s face,
      casting soft, defined shadows.
      Include understated touches of Renaissance luxury —
      perhaps a carved wooden chair or a hint of tapestry in the background.

      Mood:
      Dignified. Noble. Timeless.
    `,
    thumbnailUrl: styleRoyal,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Dramatic ambience with tasteful props.",
    thumbnailUrl: styleFantasy,
    prompt:
      "Render the pet in a tasteful fantasy scene with subtle magical ambience and dramatic but soft lighting. Preserve exact likeness; avoid cluttered props."
  },
  {
    id: "impressionist",
    name: "Impressionist Garden",
    prompt: `
      Task:
      Convert the uploaded photo of my pet into a beautiful, vibrant Impressionist painting.

      CRITICAL PRIORITY:
      Maintain the exact and recognizable likeness of the pet.
      While the style is Impressionistic, the pet's unique features — its eye shape, fur patterns,
      and overall silhouette — must remain clearly identifiable and distinctive.
      It should be recognizably the same pet, seen through an Impressionist lens.

      Style:
      Lush, vibrant Impressionistic painting.
      Characterized by visible, loose brushstrokes and a focus on light, color, and atmosphere.
      Use a rich, natural color palette that captures the fleeting interplay of sunlight and shadow.
      Colors should blend and contrast dynamically, evoking movement and life.

      Scene:
      Depict the pet outdoors in a sun-drenched, blooming garden or vibrant meadow in late afternoon.
      The light is warm, golden, and dappled — creating shimmering reflections and soft shadows.
      The background should be a soft blur of color — greens, yellows, reds, and blues from flowers and foliage —
      rendered with loose, expressive Impressionistic brushwork.
      The pet itself should retain slightly more definition to preserve its form and likeness.

      Mood:
      Serene, lively, ethereal, filled with light.
    `,
    thumbnailUrl: styleImpressionist,
  },
  {
    id: "watercolor",
    name: "Whimsical Watercolor",
    prompt: `
      Task:
      Convert the uploaded photo of my pet, named "{{Pet Name}}", into a high-end watercolor painting.

      CRITICAL PRIORITY:
      The most important goal is to maintain the exact and recognizable likeness of the pet.
      Every unique feature — the specific shape of the eyes, the pattern of the fur, the set of the mouth,
      and its individual expression — must be captured with precision.
      The pet's face and features should look exactly like the photo, just rendered in a watercolor style.

      Style:
      A master-level, luminous watercolor painting.

      Scene:
      Place the pet in a beautiful, sun-dappled bay window.
      The lighting should be warm and natural.
      Outside the window, create a soft-focus, dreamlike (bokeh) garden
      with hints of green foliage and lavender flowers.

      Technique:
      Use soft, wet-on-wet washes for the out-of-focus background.
      For the pet itself, use finer, more detailed brushstrokes (wet-on-dry)
      to capture the texture of the fur and the glint in its eyes.
      Do not abstract or "cartoonify" the pet's features.
    `,
    thumbnailUrl: styleWatercolor,
  },
  {
    id: "pencil",
    name: "Pencil Sketch",
    description: "Hand-drawn graphite with delicate shading on textured paper.",
    thumbnailUrl: stylePencil,
    isNew: true,
    prompt:
      "Render the pet as a realistic pencil drawing on lightly textured paper. Preserve exact likeness, eyes and proportions with fine hatching and subtle tonal gradients."

  },
  {
    id: "surrealist",
    name: "Surrealist Dream",
    prompt: `
      Task:
      Convert the uploaded photo of my pet into a thought-provoking and beautiful Surrealist artwork.

      CRITICAL PRIORITY:
      Maintain the exact and recognizable likeness of the pet.
      Despite the surreal elements, the pet's unique face, form, and individual characteristics
      must be unmistakably the same animal — not a generic creature.
      Its features should be rendered with realistic detail, contrasting with fantastical surroundings.

      Style:
      Dreamlike, illogical, and symbolic Surrealism.
      Combine realism with unexpected, juxtaposed, and impossible imagery.
      The pet should be meticulously detailed to create a grounded focal point,
      contrasted against bizarre or otherworldly elements.
      Colors may range from muted and earthy to stark and vibrant, with occasional unnatural lighting.

      Scene:
      Place the pet within an impossible, dreamlike landscape.
      It might rest calmly on a giant floating teacup beneath a sky of melting clocks,
      or cast a shadow that extends into a swirling galaxy while sitting on a barren desert plain.

      Option A (Gentle Surrealism):
      The pet remains realistic, but its fur is subtly made of delicate, shifting clouds,
      or it bears tiny, impossible butterfly wings that don't quite fly.
      It sits on a giant, shimmering pearl amid a still, glassy ocean reflecting an alien sky.

      Option B (More Bizarre):
      The pet's eyes are replaced by miniature, detailed landscapes,
      or its paws become roots growing into the ground while the body remains itself.
      It observes a grand, impossible architectural structure in the distance.

      Mood:
      Mysterious, intriguing, dreamlike, wondrous, slightly unsettling.
    `,
    thumbnailUrl: styleSurrealist,
  },
];
