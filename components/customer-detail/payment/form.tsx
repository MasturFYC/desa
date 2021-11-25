import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iPayment } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";

type PaymentFormProps = {
  data: iPayment;
  updatePayment: (method: string, data: iPayment) => void;
  closeForm: () => void;
};

const KasbonForm: NextPage<PaymentFormProps> = ({
  data,
  updatePayment,
  closeForm,
}) => {
  let [payment, setPayment] = React.useState<iPayment>({} as iPayment);
  let [message, setMessage] = useState<string>("");

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
    const url = `/api/payment/${payment.id}`;
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
    const url = `/api/payment/${payment.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iPayment | any = await res.json();

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
    <View
      paddingY={"size-100"}
      paddingX={{ base: "size-100", M: "size-1000" }}
    >
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <TextField
            autoFocus
            width={"auto"}
            flex
            //width={{ base: "auto", M: "67%" }}
            isRequired
            placeholder={"e.g. Cicilan utang"}
            label={"Keterangan"}
            value={payment.descriptions}
            onChange={(e) => setPayment((o) => ({ ...o, descriptions: e }))}
          />
          <TextField
            type={"date"}
            width={{ base: "auto", M: "30%" }}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Tanggal cicilan"}
            value={dateOnly(payment.paymentDate)}
            onChange={(e) => setPayment((o) => ({ ...o, paymentDate: e }))}
          />
          <NumberField
            isRequired
            hideStepper={true}
            width={{ base: "auto", M: "25%" }}
            label={"Total bayar"}
            onChange={(e) => setPayment((o) => ({ ...o, total: e }))}
            value={payment.total}
          />
        </Flex>
        <Flex
          direction="row"
          gap="size-100"
          marginBottom={"size-100"}
          marginTop={"size-200"}
        >
          <View flex>
            <Button type={"submit"} variant="cta">
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
    </View>
  );
};

export default KasbonForm;
