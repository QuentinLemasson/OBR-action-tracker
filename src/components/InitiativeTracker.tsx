import { useEffect, useRef, useState } from "react";

import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Box from "@mui/material/Box";

import SkipNextRounded from "@mui/icons-material/SkipNextRounded";

import OBR from "@owlbear-rodeo/sdk";

import { InitiativeItem } from "../types/InitiativeItem";
import { InitiativeListItem } from "./InitiativeListItem";
import { getPluginId } from "../functions/getPluginId";
import { InitiativeHeader } from "./InitiativeHeader";
import { isMetadata } from "../functions/isMetadata";
import { useInitiativeContextMenu } from "../hooks/useInitiativeContextMenu";
import { useInitiativeItemsUpdate } from "../hooks/useInitiativeItemsUpdate";
import { useInitiativeRoleManagement } from "../hooks/useInitiativeRoleManagement";

export function InitiativeTracker() {

  const [initiativeItems, setInitiativeItems] = useState<InitiativeItem[]>([]);
  const [role, setRole] = useState<"GM" | "PLAYER">("PLAYER");

  useInitiativeRoleManagement(setRole);
  useInitiativeItemsUpdate(setInitiativeItems);
  useInitiativeContextMenu();

  function handleNextClick() {
    // Get the next index to activate
    const sorted = initiativeItems.sort(
      (a, b) => a.order<b.order ? 1 : -1
    );

    const currentIndex = sorted.findIndex((initiative) => initiative.active);
    const nextIndex = (currentIndex+1)  % sorted.length;
      

    // Set local items immediately
    setInitiativeItems((prev) => {
      return prev.map((init, index) => ({
        ...init,
        active: index === nextIndex,
        actionsLeft: index===currentIndex ? init.maxActions : init.actionsLeft,
      }));
    });
    // Update the scene items with the new active status
    OBR.scene.items.updateItems(
      initiativeItems.map((init) => init.id),
      (items) => {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          const metadata = item.metadata[getPluginId("metadata")];
          if (isMetadata(metadata)) {
            metadata.active = i === nextIndex;
            metadata.actionsLeft = i===currentIndex ? metadata.maxActions : metadata.actionsLeft;
          }
        }
      }
    );
  }

  function handleInitiativeCountChange(id: string, newCount: number) {
    // Set local items immediately
    setInitiativeItems((prev) =>
      prev.map((initiative) => {
        if (initiative.id === id) {
          return {
            ...initiative,
            order: newCount,
          };
        } else {
          return initiative;
        }
      })
    );
    // Sync changes over the network
    OBR.scene.items.updateItems([id], (items) => {
      for (let item of items) {
        const metadata = item.metadata[getPluginId("metadata")];
        if (isMetadata(metadata)) {
          metadata.order = newCount;
        }
      }
    });
  }

  function handleActionLeftDecrease(id: string) {
    console.log('handle action decrease for ' + id)
    console.log(initiativeItems)
    // Set local items immediately
    setInitiativeItems((prev) =>
      prev.map((initiative) => {
        if (initiative.id === id) {
          console.log(id + "found ! Decrease initiative from " + initiative.actionsLeft + " to " + Math.max(initiative.actionsLeft-1,0))
          return {
            ...initiative,
            actionsLeft: Math.max(initiative.actionsLeft-1,0),  // assert min actions left is capped to 0
          };
        } else {
          return initiative;
        }
      })
    );
    // Sync changes over the network
    OBR.scene.items.updateItems([id], (items) => {
      for (let item of items) {
        const metadata = item.metadata[getPluginId("metadata")];
        if (isMetadata(metadata)) {
          metadata.actionsLeft = Math.max(metadata.actionsLeft-1,0)
        }
      }
    });
  }

  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (listRef.current && ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          // Get the height of the border box
          // In the future you can use `entry.borderBoxSize`
          // however as of this time the property isn't widely supported (iOS)
          const borderHeight = entry.contentRect.bottom + entry.contentRect.top;
          // Set a minimum height of 64px
          const listHeight = Math.max(borderHeight, 64);
          // Set the action height to the list height + the card header height + the divider
          OBR.action.setHeight(listHeight + 64 + 1);
        }
      });
      resizeObserver.observe(listRef.current);
      return () => {
        resizeObserver.disconnect();
        // Reset height when unmounted
        OBR.action.setHeight(129);
      };
    }
  }, []);

  return (
    <Stack height="100vh">
      <InitiativeHeader
        subtitle={
          initiativeItems.length === 0
            ? "Select a character to start initiative"
            : undefined
        }
        action={
          <IconButton
            aria-label="next"
            onClick={handleNextClick}
            disabled={initiativeItems.length === 0}
          >
            <SkipNextRounded />
          </IconButton>
        }
      />
      <Box sx={{ overflowY: "auto" }}>
        <List ref={listRef}>
          {initiativeItems
            .sort((a, b) => a.order<b.order ? 1 : -1)
            .map((initiative) => (
              <InitiativeListItem
                key={initiative.id}
                initiative={initiative}
                onCountChange={(newCount) => {
                  handleInitiativeCountChange(initiative.id, newCount);
                }}
                onActionDisplayClick={() => {
                  handleActionLeftDecrease(initiative.id);
                }}
                showHidden={role === "GM"}
              />
            ))}
        </List>
      </Box>
    </Stack>
  );
}