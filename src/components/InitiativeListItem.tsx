import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Input from "@mui/material/Input";
import ListItemIcon from "@mui/material/ListItemIcon";

import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";

import OBR, { Math2, Vector2 } from "@owlbear-rodeo/sdk";

import { InitiativeItem } from "../types/InitiativeItem";
import './InitiativeListItem.css'

type InitiativeListItemProps = {
  initiative: InitiativeItem;
  onCountChange: (count: number) => void;
  onActionDisplayClick: () => void;
  showHidden: boolean;
};

export function InitiativeListItem({
  initiative,
  onCountChange,
  onActionDisplayClick,
  showHidden,
}: InitiativeListItemProps) {
  if (!initiative.visible && !showHidden) {
    return null;
  }

  async function handleDoubleClick() {
    // Deselect the list item text
    window.getSelection()?.removeAllRanges();

    // Select this item
    await OBR.player.select([initiative.id]);

    // Focus on this item

    // Convert the center of the selected item to screen-space
    const bounds = await OBR.scene.items.getItemBounds([initiative.id]);
    const boundsAbsoluteCenter = await OBR.viewport.transformPoint(
      bounds.center
    );

    // Get the center of the viewport in screen-space
    const viewportWidth = await OBR.viewport.getWidth();
    const viewportHeight = await OBR.viewport.getHeight();
    const viewportCenter: Vector2 = {
      x: viewportWidth / 2,
      y: viewportHeight / 2,
    };

    // Offset the item center by the viewport center
    const absoluteCenter = Math2.subtract(boundsAbsoluteCenter, viewportCenter);

    // Convert the center to world-space
    const relativeCenter = await OBR.viewport.inverseTransformPoint(
      absoluteCenter
    );

    // Invert and scale the world-space position to match a viewport position offset
    const viewportScale = await OBR.viewport.getScale();
    const viewportPosition = Math2.multiply(relativeCenter, -viewportScale);

    await OBR.viewport.animateTo({
      scale: viewportScale,
      position: viewportPosition,
    });
  }

  return (
    <ListItem
      key={initiative.id}
      secondaryAction={
        <Input
          disableUnderline
          sx={{ width: 48 }}
          inputProps={{
            sx: {
              textAlign: "right",
            },
          }}
          value={initiative.order}
          onChange={(e) => {
            const newCount = Number(e.target.value);
            onCountChange(newCount);
          }}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      }
      divider
      selected={initiative.active}
      sx={{
        pr: "64px",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <ListItemIcon sx={{ minWidth: "30px"}}>
          <img className='item-token' src={initiative.token}/>
        </ListItemIcon>
      {!initiative.visible && showHidden && (
        <ListItemIcon sx={{ minWidth: "30px", opacity: "0.5" }}>
          <VisibilityOffRounded fontSize="small" />
        </ListItemIcon>
      )}
      <ListItemText sx={{ color: "text.primary" }} primary={initiative.name} />
      <ul className="action-counter" onClick={onActionDisplayClick}>
        { Array(initiative.maxActions).fill(0).map((_, i) => (
          <li className="action-bubble" data-is-available={i < initiative.actionsLeft}></li>
        ))}
      </ul>
    </ListItem>
  );
}