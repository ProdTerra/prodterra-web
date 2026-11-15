"use client";

import { ArrowDown, ArrowUp, Copy, EllipsisVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useId, useRef, useState } from "react";
import { useDismissOnOutside } from "@/shared/components/useDismissOnOutside";

type BlockActionsMenuProps = {
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDuplicate: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

export function BlockActionsMenu(props: BlockActionsMenuProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismissOnOutside(isOpen, containerRef, close);

  const actions = [
    { label: translate("moveUp"), icon: ArrowUp, isEnabled: props.canMoveUp, run: props.onMoveUp },
    { label: translate("moveDown"), icon: ArrowDown, isEnabled: props.canMoveDown, run: props.onMoveDown },
    { label: translate("duplicate"), icon: Copy, isEnabled: props.canDuplicate, run: props.onDuplicate },
    { label: translate("remove"), icon: Trash2, isEnabled: true, run: props.onRemove },
  ];

  return (
    <div ref={containerRef} className="block-menu">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={translate("blockActions", { name: props.name })}
        onClick={() => setIsOpen((open) => !open)}
        className="icon-button"
      >
        <EllipsisVertical aria-hidden size={20} />
      </button>
      {isOpen && (
        <div id={menuId} role="menu" className="block-menu__panel">
          {actions.map(({ label, icon: Icon, isEnabled, run }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={!isEnabled}
              onClick={() => {
                close();
                run();
              }}
              className="block-menu__item"
            >
              <Icon aria-hidden size={18} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
