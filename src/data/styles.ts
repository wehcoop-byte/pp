
export interface Style {
  id: string;
  name: string;
  prompt: string;
  thumbnailUrl: string;
}

export const STYLES: Style[] = [
  {
    id: 'royal',
    name: 'Royal Oil Painting',
    prompt: 'masterpiece oil painting, Renaissance era royal portrait of a regal pet, sitting on a carved stone pedestal with the inscription "{{Pet Name}}". The pet has a noble expression, {{background}} background, museum-quality, classic style, rich dramatic brushwork, sophisticated lighting',
    thumbnailUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/style_royal.png',
  },
  {
    id: 'impressionist',
    name: 'Impressionist Garden',
    prompt: 'impressionist painting of a happy pet in a sun-dappled garden. The pet, named "{{Pet Name}}", is surrounded by {{background}}. The style should have visible brushstrokes, vibrant colors, and a focus on light and movement, in the style of Monet',
    thumbnailUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/style_impressionist.png',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi Hero',
    prompt: 'digital illustration of a heroic pet as a sci-fi character named "{{Pet Name}}". The pet is wearing futuristic gear, set against a {{background}} background. The style should be sleek, with neon accents, dynamic lighting, and a cinematic feel',
    thumbnailUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/style_scifi.png',
  },
  {
    id: 'watercolor',
    name: 'Whimsical Watercolor',
    prompt: 'charming watercolor illustration of a cute pet named "{{Pet Name}}". Soft, transparent washes of color, with delicate linework. The pet is in a {{background}} setting. The overall feeling should be light, airy, and whimsical',
    thumbnailUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/style_watercolor.png',
  },
];