/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { TextProps, ViewProps } from "@aws-amplify/ui-react";
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type MiddlePaneOverridesProps = {
    MiddlePane?: PrimitiveOverrideProps<ViewProps>;
    "Window Background"?: PrimitiveOverrideProps<ViewProps>;
    "Forgot Password..."?: PrimitiveOverrideProps<TextProps>;
    "Password Entry"?: PrimitiveOverrideProps<ViewProps>;
    "Rectangle "?: PrimitiveOverrideProps<ViewProps>;
    "Password..."?: PrimitiveOverrideProps<TextProps>;
    "Username Entry"?: PrimitiveOverrideProps<ViewProps>;
    Rectangle?: PrimitiveOverrideProps<ViewProps>;
    "Username..."?: PrimitiveOverrideProps<TextProps>;
    "Search and Rescue Cellular Forensics Service"?: PrimitiveOverrideProps<TextProps>;
} & EscapeHatchProps;
export declare type MiddlePaneProps = React.PropsWithChildren<Partial<ViewProps> & {
    overrides?: MiddlePaneOverridesProps | undefined | null;
}>;
export default function MiddlePane(props: MiddlePaneProps): React.ReactElement;
