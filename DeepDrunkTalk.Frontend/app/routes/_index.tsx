import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {
  return (
    <><p>Hello World</p><p>This is a test</p></>
  );
}
