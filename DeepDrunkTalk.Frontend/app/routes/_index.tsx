import type { MetaFunction } from "@remix-run/node";
import { Button , Divider } from '@mantine/core';

import "../assets/css/general.css"
import Auth from "./_auth";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {
  return (
    Auth()
  );
}
