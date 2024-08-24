/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { Text, View } from "@aws-amplify/ui-react";
export default function LoginButton(props) {
  const { overrides, ...rest } = props;
  return (
    <View
      width="260px"
      height="74px"
      display="block"
      gap="unset"
      alignItems="unset"
      justifyContent="unset"
      position="relative"
      padding="0px 0px 0px 0px"
      {...getOverrideProps(overrides, "LoginButton")}
      {...rest}
    >
      <View
        width="260px"
        height="74px"
        display="block"
        gap="unset"
        alignItems="unset"
        justifyContent="unset"
        position="absolute"
        top="0%"
        bottom="0%"
        left="0%"
        right="0%"
        boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
        borderRadius="10px"
        padding="0px 0px 0px 0px"
        backgroundColor="rgba(48,147,199,1)"
        {...getOverrideProps(overrides, "Rectangle")}
      ></View>
      <Text
        fontFamily="Inter"
        fontSize="28px"
        fontWeight="700"
        color="rgba(255,255,255,1)"
        lineHeight="33.8863639831543px"
        textAlign="center"
        display="block"
        direction="column"
        justifyContent="unset"
        width="216px"
        height="45px"
        gap="unset"
        alignItems="unset"
        position="absolute"
        top="18.92%"
        bottom="20.27%"
        left="8.46%"
        right="8.46%"
        padding="0px 0px 0px 0px"
        whiteSpace="pre-wrap"
        children="Login"
        {...getOverrideProps(overrides, "Login")}
      ></Text>
    </View>
  );
}
