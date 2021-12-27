import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iCustomer, iSpecialOrder } from "@components/interfaces";
import { AsyncListData } from '@react-stately/data'
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { Divider } from "@react-spectrum/divider";



export interface CustomerSpecialOrder extends iSpecialOrder {
  name?: string;
}

type SpecialOrderFormProps = {
  customerList: AsyncListData<iCustomer>,
  data: CustomerSpecialOrder;
  updateOrder: (method: string, data: CustomerSpecialOrder) => void;
  closeForm: () => void;
  children: JSX.Element
};

export default function SpecialOrderForm(props: SpecialOrderFormProps) {
  let {customerList, data, updateOrder, closeForm, children} = props;
  let [order, setOrder] = React.useState<CustomerSpecialOrder>({} as CustomerSpecialOrder);
  let [message, setMessage] = useState<string>('');
  let [customer, setCustomer] = useState<iCustomer>(customerList.getItem(data.customerId));

  const isCustomerIdValid = React.useMemo(
    () => order && order.customerId && order.customerId > 0,
    [order]
  );

  const isSuratJalanValid = React.useMemo(
    () => order && order.suratJalan && order.suratJalan.length > 0,
    [order]
  );

  const isDriverValid = React.useMemo(
    () => order && order.driverName && order.driverName.length > 0,
    [order]
  );
  const isPoliceValid = React.useMemo(
    () => order && order.policeNumber && order.policeNumber.length > 0,
    [order]
  );
  const isStreetValid = React.useMemo(
    () => order && order.street && order.street.length > 0,
    [order]
  );
  const isPhoneValid = React.useMemo(
    () => order && order.phone && order.phone.length > 0,
    [order]
  );
  const isCityValid = React.useMemo(
    () => order && order.city && order.city.length > 0,
    [order]
  );

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
    const url = `${process.env.apiKey}/special-order/${order.id}`;
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
      updateOrder(order.id === 0 ? 'POST' : 'PUT', { ...json, name: customerList.getItem(order.customerId).name });
      if (order.id > 0) {
        closeForm();
      }
    } else {
      console.log(json.message);
      setMessage('Data order tidak bisa dipost, lihat log.');
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postOrder(order.id === 0 ? 'POST' : 'PUT');
  };


  const deleteOrder = async () => {
    const url = `${process.env.apiKey}/special-order/${order.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: CustomerSpecialOrder | any = await res.json();

    if (res.status === 200) {
      updateOrder('DELETE', order);
      closeForm();
    } else {
      console.log(data);
      setMessage('Order tidak dapat dihapus, ada pembayaran piutang terkait order ini.');
    }
  };

  return (<View paddingX={{ base: "size-50", M: "size-100" }}>
    <Form onSubmit={handleSubmit}>
      <Flex direction="row" gap="size-100" marginBottom={"size-100"}>
        <View flex>
          <Button type={"submit"} variant="cta"
            isDisabled={isCustomerIdValid === 0 ||
              isPhoneValid === '' ||
              isDriverValid === '' ||
              isPoliceValid === '' ||
              isStreetValid === '' ||
              isSuratJalanValid === '' ||
              isCityValid === '' ||
              order.payments < 0}
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
            <Button type={"button"} variant="negative"
              onPress={() => deleteOrder()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
      <Flex flex direction={{ base: "column", M: "row" }} gap="size-600" marginBottom={"size-100"}>
        <Flex flex direction="column">
          <div style={{ fontWeight: 700 }}>Informasi pembeli:</div>
          <ComboBox
            autoFocus={order.id === 0}
            validationState={isCustomerIdValid ? "valid" : "invalid"}
            width={"auto"}
            label={"Pembeli"}
            placeholder={"e.g. pilih pembeli"}
            defaultItems={customerList.items}
            selectedKey={order.customerId}
            onSelectionChange={(e) => {
              setOrder((o) => ({
                ...o,
                customerId: +e
              }));
              const c = customerList.getItem(+e);
              setCustomer(c);
              if (order.street.length === 0) {
                setOrder(o => ({
                  ...o,
                  street: c.street || '',
                  city: c.city || '',
                  phone: c.phone || ''
                }));
              }
            } }
          >
            {(item) => <Item>{item.name}</Item>}
          </ComboBox>
          <View flex marginTop={"size-100"}>
            <strong>Alamat</strong>:<br />
            {customer &&
              <View>
                {customer.street} - {customer.city}, Telp.{customer.phone}
              </View>}
          </View>
        </Flex>
        <View flex>
          <div style={{ fontWeight: 700 }}>Informasi pengiriman:</div>
          <TextField
            flex
            autoFocus={order.id > 0}
            width={'100%'}
            aria-autocomplete={"both"}
            validationState={isSuratJalanValid ? "valid" : "invalid"}
            placeholder={"e.g. Johni"}
            label={"Surat jalan"}
            value={order.suratJalan}
            onChange={(e) => setOrder((o) => ({ ...o, suratJalan: e }))} />
          <Flex direction={"row"} columnGap={"size-100"}>
            <TextField
              flex
              aria-autocomplete={"both"}
              validationState={isDriverValid ? "valid" : "invalid"}
              placeholder={"e.g. Johni"}
              label={"Supir"}
              value={order.driverName}
              onChange={(e) => setOrder((o) => ({ ...o, driverName: e }))} />
            <TextField
              flex
              aria-autocomplete={"both"}
              validationState={isPoliceValid ? "valid" : "invalid"}
              placeholder={"e.g. E-0598-EM"}
              label={"No. Mobil"}
              value={order.policeNumber}
              onChange={(e) => setOrder((o) => ({ ...o, policeNumber: e }))} />
          </Flex>
          <TextArea
            width={"100%"}
            flex
            validationState={isStreetValid ? "valid" : "invalid"}
            placeholder={"e.g. Jl. Jend. Sudirman No. 155 Tanjung Priuk\nJakarta Timur"}
            label={"Alamat pengiriman"}
            value={order.street}
            onChange={(e) => setOrder((o) => ({ ...o, street: e }))} />
          <Flex direction={"row"} columnGap={"size-100"}>
            <TextField
              flex
              validationState={isCityValid ? "valid" : "invalid"}
              placeholder={"e.g. Jakarta"}
              label={"Kota"}
              value={order.city}
              onChange={(e) => setOrder((o) => ({ ...o, city: e }))} />
            <TextField
              flex
              validationState={isPhoneValid ? "valid" : "invalid"}
              placeholder={"e.g. 085231654455"}
              label={"Telephone"}
              value={order.phone}
              onChange={(e) => setOrder((o) => ({ ...o, phone: e }))} />
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
          onChange={(e) => setOrder((o) => ({ ...o, createdAt: e }))} />
        <TextField
          flex
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal Pengepakan"}
          value={dateOnly(order.packagedAt)}
          onChange={(e) => setOrder((o) => ({ ...o, packagedAt: e }))} />
        <TextField
          flex
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal pengiriman"}
          value={dateOnly(order.shippedAt)}
          onChange={(e) => setOrder((o) => ({ ...o, shippedAt: e }))} />
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
          onChange={(e) => setOrder((o) => ({ ...o, cash: e, remainPayment: o.total - e }))} />
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
        onChange={(e) => setOrder((o) => ({ ...o, descriptions: e }))} />

    </Form>
    <View marginBottom={'size-200'}>
    {children}
    </View>
  </View>
  );
}

