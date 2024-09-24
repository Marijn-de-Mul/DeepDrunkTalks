import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export function Button() { 
  return (
    <button>Test</button>
  );
}

export default function Index() {
  return (
    <Button/>
  );
}
