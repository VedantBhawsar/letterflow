interface PlaceholderImageProps {
  text?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function PlaceholderImage({
  text = "Image Placeholder",
  className = "",
  width = 640,
  height = 480,
}: PlaceholderImageProps) {
  return (
    <div
      className={`flex items-center justify-center bg-muted/50 border border-border ${className}`}
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: `${width}/${height}`,
      }}
    >
      <p className="text-muted-foreground text-center px-4">{text}</p>
    </div>
  );
}
