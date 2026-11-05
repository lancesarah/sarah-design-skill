import { FontSwitch } from "./font-switch";
import { GallerySections } from "./gallery";
import { Specimens } from "./specimens";

export default function Page() {
  return (
    <>
      <Specimens />
      <div className="mx-auto flex w-full max-w-[1120px] flex-col px-6 pb-16">
        <GallerySections />
      </div>
      <FontSwitch />
    </>
  );
}
