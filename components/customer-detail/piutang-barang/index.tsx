import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton, Divider, Flex, Item, TabList, Tabs } from '@adobe/react-spectrum'
import { dateParam, iOrder } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";

const OrderForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false
})

const initOrder: iOrder = {
  id: 0,
  customerId: 0,
  orderDate: dateParam(null),
  total: 0,
  payment: 0,
  remainPayment: 0,
  descriptions: 'Pembelian Barang',
}

type PiutangBarangProps = {
  customerId: number
}

const PiutangBarang: NextPage<PiutangBarangProps> = ({ customerId }) => {
  let [selectedOrderId, setSelectedOrderId] = useState<number>(-1);

  let orders = useAsyncList<iOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/order/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iOrder) => item.id
  })


  const closeForm = () => {
    setSelectedOrderId(-1);
  };

  const updateOrder = (method: string, p: iOrder) => {
    switch (method) {
      case 'POST': {
        orders.insert(1, p);
      }
        break;
      case 'PUT': {
        orders.update(selectedOrderId, p);
      }
        break;
      case 'DELETE': {
        orders.remove(selectedOrderId);
      }
        break;
    }
  }


  return (
    <Fragment>
      {orders.isLoading && <WaitMe />}
      {
        orders &&
        [{ ...initOrder, customerId: customerId }, ...orders.items].map((x, i) => (
          <View
            key={x.id}
            borderStartColor={selectedOrderId === x.id ? "blue-500" : "transparent"}
            //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
            borderStartWidth={"thickest"}
          //marginY={"size-125"}
          >

            {selectedOrderId === x.id ? (
              <OrderForm
                data={x}
                updateOrder={updateOrder}
                closeForm={closeForm}
              />
            ) : renderPiutang(x)}
            <Divider size="S" />
          </View>
        ))
      }
      <div style={{ marginBottom: '24px' }} />
    </Fragment>
  );

  function renderPiutang(x: iOrder) {
    return <Flex
      marginY={"size-100"}
      direction={{ base: "column", M: "row" }}
      rowGap={"size-100"}
      columnGap="size-400"
    >
      <View width={{ base: "auto", M: "35%" }}>
        <ActionButton
          flex
          isQuiet
          onPress={() => {
            setSelectedOrderId(selectedOrderId === x.id ? -1 : x.id);
          }}
        >
          <span style={{ fontWeight: 700 }}>{x.id === 0 ? 'Piutang Baru' : x.descriptions}</span>
        </ActionButton>
      </View>
      {x.id > 0 && renderDetail(x)}
    </Flex>;
  }

  function renderDetail(x: iOrder): React.ReactNode {
    return <View flex>
      Tanggal: <strong>{FormatDate(x.orderDate)}</strong>
      <br />
      Total: {FormatNumber(x.total)}, Bayar: {FormatNumber(x.payment)},
      Piutang: <strong>{FormatNumber(x.remainPayment)}</strong>
    </View>;
  }

};

export default PiutangBarang;
