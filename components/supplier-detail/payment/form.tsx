import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iStockPayment } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import stockApi from "@api/stock/[id]";

type StockPaymentFormProps = {
  data: iStockPayment;
  updatePayment: (method: string, data: iStockPayment) => void;
  closeForm: () => void;
};

const StockPaymentForm: NextPage<StockPaymentFormProps> = ({
  data,
  updatePayment,
  closeForm,
}) => {
  let [payment, setPayment] = React.useState<iStockPayment>({} as iStockPayment);
  let [message, setMessage] = useState<string>("");

  const isPayNumValid = React.useMemo(
    () => payment && payment.payNum && payment.payNum.length > 0,
    [payment]
  )
  const isNominalValid = React.useMemo(
    () => payment && payment.nominal && payment.nominal <= data.nominal && payment.nominal !== 0,
    [payment]
  )

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setPayment(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postPayment(method: string) {
    const url = `/api/stock-payment/${payment.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: payment }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updatePayment(payment.id === 0 ? "POST" : "PUT", json);
      closeForm();
    } else {
      console.log(json.message);
      setMessage("Data pembayaran tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postPayment(payment.id === 0 ? "POST" : "PUT");
  };

  const deletePayment = async () => {
    const url = `/api/stock-payment/${payment.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iStockPayment | any = await res.json();

    if (res.status === 200) {
      updatePayment("DELETE", payment);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Payment tidak dapat dihapus, ada pembayaran piutang terkait order ini."
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          isRequired
          placeholder={"e.g. No. Faktur"}
          label={"No. Pembayaran"}
          value={payment.payNum}
          validationState={isPayNumValid ? "valid" : "invalid"}
          onChange={(e) => setPayment((o) => ({ ...o, payNum: e }))}
        />
        <TextField
          type={"date"}
          width={{ base: "auto", M: "30%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal bayar"}
          value={dateOnly(payment.payDate)}
          onChange={(e) => setPayment((o) => ({ ...o, payDate: e }))}
        />
        <NumberField
          isRequired
          hideStepper={true}
          width={{ base: "auto", M: "20%" }}
          label={"Nominal angsuran"}
          validationState={isNominalValid ? "valid" : "invalid"}
          onChange={(e) => setPayment((o) => ({ ...o, nominal: e }))}
          value={payment.nominal}
        />
      </Flex>
      <TextArea
        width={"auto"}
        flex
        placeholder={"e.g. Cicilan utang"}
        label={"Keterangan"}
        value={payment.descriptions || ''}
        onChange={(e) => setPayment((o) => ({ ...o, descriptions: e }))}
      />
      <Flex
        direction="row"
        gap="size-100"
        marginBottom={"size-100"}
        marginTop={"size-200"}
      >
        <View flex>
          <Button type={"submit"} variant="cta"
          isDisabled={isNominalValid === 0 || isPayNumValid === '' }
          >
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Cancel
          </Button>
        </View>
        {payment.id > 0 && (
          <View>
            <Button
              type={"button"}
              variant="negative"
              onPress={() => deletePayment()}
            >
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  );
};

export default StockPaymentForm;
