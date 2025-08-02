import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface AvatarProps {
  children?: React.ReactNode;
  className?: string;
}

const Avatar = ({ children, className, ...props }: AvatarProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

const AvatarImage = ({
  src,
  alt = "",
  className,
  width = 40,
  height = 40,
  ...props
}: AvatarImageProps) => {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
};

const AvatarFallback = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
