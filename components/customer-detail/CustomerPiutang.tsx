import React, { useEffect, useState } from "react";
import { iPiutang } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Divider, Flex } from "@adobe/react-spectrum";
import { FormatNumber } from "@lib/format";
import { NextPage } from "next";

type CustomerPiutangProps = {
  customerId: number
}

const CustomerPiutang:NextPage<CustomerPiutangProps> = ({customerId}) => {
  let [customer, setCustomer] = useState<iPiutang>({} as iPiutang)

  useEffect(() => {
    let isLoaded = false;

    const loadCustomer = async (id: number) => {
      const url = `/api/customer/piutang/${id}`;
      const fetchOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      };
      await fetch(url, fetchOptions)
        .then(async (response) => {
          if (response.ok) {
            return response.json().then((data) => data);
          }
          return response.json().then((error) => {
            return Promise.reject(error);
          });
        })
        .then((data) => {
          setCustomer(data)
        })
        .catch((error) => {
          console.log(error);
        });

    };    

    if (!isLoaded && customerId > 0) {
      loadCustomer(customerId);
    }

    return () => { isLoaded = true }

  }, [customerId])

  return (
    <>
      <View marginBottom={"size-100"}>
        <span style={{ fontWeight: 700 }}>Piutang</span>
      </View>
      <Flex direction={"column"} rowGap={"size-50"}>
        <Flex direction="row">
          <View flex>Keterangan</View>
          <View>Total</View>
        </Flex>
        <Divider size={"S"} />
        <Flex direction="row">
          <View flex>Piutang Barang</View>
          <View>{FormatNumber(getNumber(customer.piutang?.total))}</View>
        </Flex>
        <Divider size={"S"} />
        <Flex direction="row">
          <View flex>Kasbon</View>
          <View>{FormatNumber(getNumber(customer.kasbon?.total))}</View>
        </Flex>
        <Divider size={"S"} />
        <Flex direction="row">
          <View flex>Grand Total:</View>
          <View>
            <span style={{ fontWeight: 700 }}>
              {FormatNumber(
                getNumber(customer.piutang?.total) +
                  getNumber(customer.kasbon?.total)
              )}
            </span>
          </View>
        </Flex>
      </Flex>
    </>
  );
}

function getNumber(val: number | undefined) {
  return val ? val : 0;
}


export default CustomerPiutang;