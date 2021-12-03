import { NextPage } from "next";
import dynamic from "next/dynamic";
import React, { FormEvent, useState } from "react";
import { dateOnly, dateParam, iCustomer, iSpecialOrder } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { Divider } from "@react-spectrum/divider";
import {
  DialogContainer,
  Dialog
} from "@react-spectrum/dialog";
import { Heading } from "@react-spectrum/text";
import { Content } from '@react-spectrum/view'


const SpecialPaymentForm = dynamic(
  () => import("../payment/form"),
  {
    ssr: false,
  }
);

type SpecialOrderFormProps = {
  data: iSpecialOrder;
  updateOrder: (method: string, data: iSpecialOrder) => void;
  closeForm: () => void;
  customer: iCustomer,
  children: JSX.Element
};

const SpecialOrderForm: NextPage<SpecialOrderFormProps> = (props) => {
  let { data, updateOrder, closeForm, customer, children } = props;
  let [order, setOrder] = React.useState<iSpecialOrder>({} as iSpecialOrder);
  let [message, setMessage] = useState<string>('');
  const [open, setOpen] = React.useState(false);

  const isDriverValid = React.useMemo(
    () => order && order.driverName && order.driverName.length > 0,
    [order]
  )
  const isPoliceValid = React.useMemo(
    () => order && order.policeNumber && order.policeNumber.length > 0,
    [order]
  )
  const isStreetValid = React.useMemo(
    () => order && order.street && order.street.length > 0,
    [order]
  )
  const isPhoneValid = React.useMemo(
    () => order && order.phone && order.phone.length > 0,
    [order]
  )
  const isCityValid = React.useMemo(
    () => order && order.city && order.city.length > 0,
    [order]
  )

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setOrder(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);


  async function postOrder(method: string) {
    const url = `/api/special-order/${order.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: order }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateOrder(order.id === 0 ? 'POST' : 'PUT', json);
      if (order.id > 0) {
        closeForm();
      }
    } else {
      console.log(json.message)
      setMessage('Data order tidak bisa dipost, lihat log.')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postOrder(order.id === 0 ? 'POST' : 'PUT');
  };

  const deleteOrder = async () => {
    const url = `/api/special-order/${order.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iSpecialOrder | any = await res.json();

    if (res.status === 200) {
      updateOrder('DELETE', order)
      closeForm();
    } else {
      console.log(data);
      setMessage('Order tidak dapat dihapus, ada pembayaran piutang terkait order ini.')
    }
  }

  return (<View paddingX={{ base: "size-50", M: "size-100" }}>
    <DialogContainer
      type={"modal"}
      onDismiss={() => setOpen(false)}
      isDismissable
    >
      {open && (
        <Dialog size="L">
          <Heading>
            Angsuran
          </Heading>
          <Divider size="S" />
          <Content>
            <SpecialPaymentForm
              data={{
                id: 0,
                customerId: customer.id,
                orderId: order.id,
                paymentAt: dateParam(null),
                nominal: order.remainPayment,
                payNum: '',
                descriptions: 'Angsuran piutang dagang #' + order.id,
              }}
              updatePayment={(method, data) => {
                updateOrder(order.id === 0 ? 'POST' : 'PUT', {
                  ...order, remainPayment: order.remainPayment - data.nominal,
                  payments: order.payments + data.nominal
                });
              }}
              closeDialog={() => {
                setOpen(false);
              }}
            />
          </Content>
        </Dialog>
      )}
    </DialogContainer>

    <Form onSubmit={handleSubmit}>
      <Flex direction="row" gap="size-100" marginBottom={"size-100"}>
        <View flex>
          <Button type={"submit"} variant="cta"
            isDisabled={
              isPhoneValid === '' ||
              isDriverValid === '' ||
              isPoliceValid === '' ||
              isStreetValid === '' ||
              isCityValid === '' ||
              order.payments < 0
            }
          >
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Close
          </Button>
        </View>
        <View flex><b>#{order.id}</b></View>
        {order.id > 0 && (
          <View>
            {order.remainPayment > 0 &&
              <Button
                type={"button"}
                variant="primary"
                marginEnd={"size-100"}
                onPress={() => setOpen(true)}
              >
                Tambahkan Angsuran
              </Button>
            }
            <Button type={"button"} variant="negative"
              onPress={() => deleteOrder()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
      <Flex flex direction={{ base: "column", M: "row" }} gap="size-600" marginBottom={"size-100"}>
        <Flex flex direction="column">
          <div style={{ fontWeight: 700, marginTop: 12 }}>{customer.name}</div>
          <View flex marginTop={"size-100"}>
            <strong>Alamat</strong>:<br />
            {customer &&
              <View>
                {customer.street} - {customer.city},<br />Telp. {customer.phone}
              </View>
            }
          </View>
        </Flex>
        <View flex>
          <div style={{ fontWeight: 700 }}>Informasi pengiriman:</div>
          <Flex direction={"row"} columnGap={"size-100"}>
            <TextField
              flex
              autoFocus
              aria-autocomplete={"both"}
              validationState={isDriverValid ? "valid" : "invalid"}
              placeholder={"e.g. Johni"}
              label={"Supir"}
              value={order.driverName}
              onChange={(e) => setOrder((o) => ({ ...o, driverName: e }))}
            />
            <TextField
              flex
              aria-autocomplete={"both"}
              validationState={isPoliceValid ? "valid" : "invalid"}
              placeholder={"e.g. E-0598-EM"}
              label={"No. Mobil"}
              value={order.policeNumber}
              onChange={(e) => setOrder((o) => ({ ...o, policeNumber: e }))}
            />
          </Flex>
          <TextArea
            width={"100%"}
            flex
            validationState={isStreetValid ? "valid" : "invalid"}
            placeholder={"e.g. Jl. Jend. Sudirman No. 155 Tanjung Priuk\nJakarta Timur"}
            label={"Alamat pengiriman"}
            value={order.street}
            onChange={(e) => setOrder((o) => ({ ...o, street: e }))}
          />
          <Flex direction={"row"} columnGap={"size-100"}>
            <TextField
              flex
              validationState={isCityValid ? "valid" : "invalid"}
              placeholder={"e.g. Jakarta"}
              label={"Kota"}
              value={order.city}
              onChange={(e) => setOrder((o) => ({ ...o, city: e }))}
            />
            <TextField
              flex
              validationState={isPhoneValid ? "valid" : "invalid"}
              placeholder={"e.g. 085231654455"}
              label={"Telephone"}
              value={order.phone}
              onChange={(e) => setOrder((o) => ({ ...o, phone: e }))}
            />
          </Flex>
        </View>
      </Flex>
      <Divider size={"M"} />
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-100"}>
        <TextField
          flex
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal order"}
          value={dateOnly(order.createdAt)}
          onChange={(e) => setOrder((o) => ({ ...o, createdAt: e }))}
        />
        <TextField
          flex
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal Pengepakan"}
          value={dateOnly(order.packagedAt)}
          onChange={(e) => setOrder((o) => ({ ...o, packagedAt: e }))}
        />
        <TextField
          flex
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal pengiriman"}
          value={dateOnly(order.shippedAt)}
          onChange={(e) => setOrder((o) => ({ ...o, shippedAt: e }))}
        />
      </Flex>

      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-100"}>
        <NumberField
          flex
          isReadOnly
          hideStepper={true}
          width={"auto"}
          label={"Total"}
          onChange={(e) => setOrder((o) => ({ ...o, total: e }))}
          value={order.total} />
        <NumberField
          flex
          hideStepper={true}
          width={"auto"}
          label={"Bayar"}
          value={order.cash}
          //minValue={0}
          validationState={order.cash >= 0 ? "valid" : "invalid"}
          onChange={(e) =>
            setOrder((o) => ({ ...o, cash: e, remainPayment: o.total - e }))
          } />
        <NumberField
          flex
          isReadOnly
          hideStepper={true}
          width={"auto"}
          label={"Piutang"}
          onChange={(e) => setOrder((o) => ({ ...o, remainPayment: e }))}
          value={order.remainPayment} />
      </Flex>
      <TextArea
        width={"auto"}
        flex
        placeholder={"e.g. Pembayaran paling lambar sampai dengan tanggal ..."}
        label={"Keterangan"}
        value={order.descriptions || ''}
        onChange={(e) => setOrder((o) => ({ ...o, descriptions: e }))}
      />

    </Form>

    {order.id > 0 && children}
  </View >
  );
};

export default SpecialOrderForm;