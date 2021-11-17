import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import {
  ActionButton,
  Button,
  Divider,
  Flex,
  Text,
} from "@adobe/react-spectrum";
import {
  add,
  dateParam,
  iKasbon,
  stringDateFormat,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";
import moment from "moment";

const KasbonForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const getJatuhTempo = () => {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 7);
  return moment(currentDate, stringDateFormat).format(stringDateFormat);
};

const initKasbon: iKasbon = {
  id: 0,
  customerId: 0,
  kasbonDate: dateParam(null),
  jatuhTempo: getJatuhTempo(),
  total: 0,
  descriptions: "Kasbon",
};

type KasbonProps = {
  customerId: number;
};

const KasbonPage: NextPage<KasbonProps> = ({ customerId }) => {
  let [selectedKasbonId, setSelectedKasbonId] = useState<number>(-1);
  let [isNew, setIsNew] = useState<boolean>(false);

  let kasbons = useAsyncList<iKasbon>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/kasbon/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iKasbon) => item.id,
  });

  const closeForm = () => {
    setSelectedKasbonId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrder = (method: string, p: iKasbon) => {
    switch (method) {
      case "POST":
        {
          kasbons.insert(0, p);
        }
        break;
      case "PUT":
        {
          kasbons.update(selectedKasbonId, p);
        }
        break;
      case "DELETE":
        {
          kasbons.remove(selectedKasbonId);
        }
        break;
    }
  };

  return (
    <Fragment>
      <Button
        variant={"cta"}
        onPress={() => {
          setSelectedKasbonId(isNew ? -1 : 0);
          setIsNew(!isNew);
        }}
        marginBottom={"size-200"}
      >
        Kasbon Baru
      </Button>
      <Flex
        isHidden={{ base: true, M: false }}
        marginBottom={"size-100"}
        direction={{ base: "column", M: "row" }}
        columnGap="size-50"
      >
        <View width={"5%"}>ID#</View>
        <View flex width={{ base: "50%" }}>
          Keterangan
        </View>
        <View width={"20%"}>Tanggal</View>
        <View width={"20%"}>Jatuh Tempo</View>
        <View width="15%">
          <span style={{ textAlign: "right", display: "block" }}>Total</span>
        </View>
      </Flex>
      <Divider size={"S"} />
      {kasbons.isLoading && <WaitMe />}
      {kasbons &&
        [{ ...initKasbon, customerId: customerId }, ...kasbons.items].map(
          (x, i) => (
            <View
              key={x.id}
              borderStartColor={
                selectedKasbonId === x.id ? "blue-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedKasbonId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
            >
              {selectedKasbonId === x.id ? (
                <KasbonForm
                  data={x}
                  updateKasbon={updateOrder}
                  closeForm={closeForm}
                />
              ) : (
                renderKasbon({ x, isNew })
              )}
            </View>
          )
        )}
      <Flex direction={"row"}>
        <View flex>Grand Total: </View>
        <View>
          <Text>
            <strong>
              {FormatNumber(kasbons.items.reduce((a, b) => a + b.total, 0))}
            </strong>
          </Text>
        </View>
      </Flex>
      <div style={{ marginBottom: "24px" }} />
    </Fragment>
  );

  function renderKasbon({ x, isNew }: { x: iKasbon; isNew: boolean }) {
    return (
      <Fragment>
        <Flex
          isHidden={x.id === 0 && !isNew}
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-50"
          wrap={"wrap"}
        >
          <View width={"5%"}>{x.id}</View>
          <View flex width={{ base: "50%", M: "auto" }}>
            <ActionButton
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedKasbonId(selectedKasbonId === x.id ? -1 : x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Piutang Baru" : x.descriptions}
              </span>
            </ActionButton>
          </View>
          <View width={{ base: "40%", M: "20%" }}>
            {FormatDate(x.kasbonDate)}
          </View>
          <View width={{ base: "50%", M: "20%" }}>
            {FormatDate(x.jatuhTempo)}
          </View>
          <View width={{ base: "48%", M: "15%" }}>
            <span
              style={{ textAlign: "right", display: "block", fontWeight: 700 }}
            >
              {FormatNumber(x.total)}
            </span>
          </View>
        </Flex>
        {x.id > 0 && <Divider size={"S"} />}
      </Fragment>
    );
  }
};

export default KasbonPage;
