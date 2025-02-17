declare module "*.json" {
  const value: {
    title: string;
    created_at: string;
    updated_at: string;
    metadata: {
      time: {
        start: number;
        end: number;
      };
      title: string;
      synopsis: string;
      timecode: string;
    }[];
  };
  export default value;
} 