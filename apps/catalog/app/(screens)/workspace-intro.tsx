"use client";

import {
  Button,
  DepartmentChip,
  FilterSubmenu,
  Icon,
  Person,
  SegmentedControl,
  TextIcon,
  Widget,
  WidgetList,
  WidgetRow,
} from "@lance-live/sds";
import { createShader, playSweep, type ShaderController, type SweepHandle } from "glimm";
import { useEffect, useId, useRef } from "react";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

const showcaseTodos = [
  { title: "Hallway", subtitle: "Ice machine", age: "20m", assigned: true },
  { title: "816", subtitle: "Bug / insect", age: "2h", assigned: false },
  { title: "1021", subtitle: "Full service", age: "1h", assigned: true },
  { title: "1120", subtitle: "Full service", age: "1h", assigned: true },
];

function WorkspacePreview() {
  const assets = "/images/workspace-intro";
  return (
    <>
      <img className="workspace-intro-diagonal" src={`${assets}/diagonal.svg`} alt="" />
      <div className="workspace-intro-browser">
        <div className="workspace-intro-browser-bar">
          <span className="workspace-intro-browser-lights"><i /><i /><i /></span>
          <img src={`${assets}/sidebar.svg`} alt="" />
          <img src={`${assets}/arrows.svg`} alt="" />
          <span className="workspace-intro-browser-address">
            <span><img src={`${assets}/more.svg`} alt="" /></span>
            lance.live/live
          </span>
        </div>
        <img className="workspace-intro-browser-image" src={`${assets}/workspace.png`} alt="" />
      </div>
    </>
  );
}

export function WorkspaceIntro({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const title = "Lance has a new look.";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      titleRef.current?.focus({ preventScroll: true });
    }

    const backdrop = backdropRef.current;
    const canvas = canvasRef.current;
    if (!backdrop || !canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let shader: ShaderController | null = null;
    let sweep: SweepHandle | undefined;
    backdrop.hidden = false;

    function finish() {
      if (backdrop) backdrop.hidden = true;
      shader?.destroy();
      shader = null;
    }

    const startTimer = window.setTimeout(() => {
      if (!dialog.open) return;
      shader = createShader({ canvas, feather: 0 });
      if (!shader) {
        finish();
        return;
      }
      sweep = playSweep(shader, {
        direction: "ltr",
        palette: {
          a: [0.432, 0.656, 0.936],
          b: [0.24, 0.248, 0.08],
          c: [0.50, 0.50, 0.50],
          d: [0.86, 0.97, 0.67],
        },
        bandTight: 9,
        easing: "easeOutCubic",
        sweepMs: 1550,
        peakAlpha: 0.75,
      });
      void sweep.done.then(() => {
        if (shader) finish();
      });
    }, 280);

    return () => {
      window.clearTimeout(startTimer);
      sweep?.cancel();
      finish();
    };
  }, []);

  function dismiss() {
    dialogRef.current?.close();
  }

  return (
    <>
      <div ref={backdropRef} className="workspace-intro-transition" aria-hidden="true" inert hidden>
        <canvas ref={canvasRef} />
      </div>
      <dialog
        ref={dialogRef}
        className="sds workspace-intro workspace-intro-showcase"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={onDismiss}
      >
        <div className="workspace-intro-hero">
          <div className="workspace-intro-art" aria-hidden="true" inert>
            <div className="workspace-intro-preview">
              <div className="workspace-intro-preview-row">
                <div className="workspace-intro-assignment">
                  <FilterSubmenu field="Assigned" selected={["Mark"]} readOnly />
                </div>
                <div className="workspace-intro-todos">
                  <Widget icon="clipboard" title="To-dos" count={9} action={<TextIcon icon="plus-bold" size="sm" aria-label="Add to-do" />}>
                    <WidgetList>
                      {showcaseTodos.map(({ title, subtitle, age, assigned }) => (
                        <WidgetRow
                          key={title}
                          as="div"
                          title={title}
                          subtitle={subtitle}
                          meta={age}
                          trail={assigned ? <Person name="Sarah" initials="SM" variant="pill" /> : <Person name="Unassigned" variant="unassigned" />}
                        />
                      ))}
                    </WidgetList>
                  </Widget>
                </div>
              </div>
              <WorkspacePreview />
              <div className="workspace-intro-preview-controls">
                <DepartmentChip name="Front desk" />
                <SegmentedControl aria-label="To-do status" value="open" options={statusOptions} readOnly />
              </div>
            </div>
          </div>
          <Button icon variant="secondary" className="workspace-intro-close" aria-label="Close introduction" onClick={dismiss}>
            <Icon name="close" size={14} />
          </Button>
        </div>
        <div className="workspace-intro-copy">
          <span className="workspace-intro-badge">NEW</span>
          <h1 id={titleId} ref={titleRef} tabIndex={-1}>{title}</h1>
          <div id={descriptionId} className="workspace-intro-description">
            <p>A fresh look for everything you do here. Take a look around and make yourself at home.</p>
            <p>Have questions? Reach out—we’re happy to help.</p>
          </div>
        </div>
        <div className="workspace-intro-footer">
          <Button onClick={dismiss}>Continue</Button>
        </div>
      </dialog>
    </>
  );
}
