import React from "react";
import {
  ConstellationField as BaseConstellationField,
  GatewayFlow,
  type NeuformBatchEffectProps,
} from "./neuform-isolated/NeuformBatchEffects";

export * from "./warp-field/WarpFieldBackground";
export * from "./neuform-isolated/NeuformBatchEffects";

export function ConstellationField(props: NeuformBatchEffectProps) {
  if (props.variant === "gateway-flow") {
    return React.createElement(GatewayFlow, props);
  }
  return React.createElement(BaseConstellationField, props);
}
