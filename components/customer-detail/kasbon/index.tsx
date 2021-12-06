import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";

import { ActionButton, Button } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';
import { Text } from '@react-spectrum/text';
import {
  add,
  dateParam,
  iKasbon,
  stringDateFormat,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";
import moment from "moment";
import Div from "@components/ui/Div";

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
  lunasId:0,
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

  let kasbons = useAsyncList<iKasbon>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/kasbon/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iKasbon) => item.id,
  });

  const closeForm = () => {
    if(selectedKasbonId === 0) {
      kasbons.remove(0)
    }
    setSelectedKasbonId(-1);
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
          if(!kasbons.getItem(0)) {
            kasbons.insert(0, { ...initKasbon, customerId: customerId });
          }
          setSelectedKasbonId(0);
        }}
        marginBottom={"size-200"}
      >
        Kasbon Baru
      </Button>
      <Div isHidden isHeader>
        <Flex
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
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
      </Div>
      {kasbons.isLoading && <WaitMe />}
      {kasbons &&
        kasbons.items.map(
          (x, i) => (
            <Div key={x.id}>
              {selectedKasbonId === x.id ? (
                <KasbonForm
                  data={x}
                  updateKasbon={updateOrder}
                  closeForm={closeForm}
                />
              ) : (
                renderKasbon({ x })
              )}
            </Div>
          )
        )}
        <Div isFooter>
      <Flex direction={"row"} marginX={"size-100"}>
        <View flex>Grand Total: </View>
        <View>
          <Text>
            <strong>
              {FormatNumber(kasbons.items.reduce((a, b) => a + b.total, 0))}
            </strong>
          </Text>
        </View>
      </Flex>
      </Div>
    </Fragment>
  );

  function renderKasbon({ x }: { x: iKasbon }) {
    return (
      <Flex
        marginX={"size-100"}
        direction={"row"}
        columnGap="size-50"
        wrap={"wrap"}
      >
        <View width={"5%"}>{x.id}</View>
        <View flex width={{ base: "50%", M: "auto" }}>
          {x.refLunasId === 0
          ?
          <ActionButton
            height={"auto"}
            isQuiet
            onPress={() => {
              setSelectedKasbonId(x.id);
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {x.id === 0 ? "Piutang Baru" : x.descriptions}
            </span>
          </ActionButton>
          :
            <View>{ x.descriptions}</View>
          }
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
    );
  }
};

export default KasbonPage;
