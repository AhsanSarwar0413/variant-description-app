import { useState, useCallback, useEffect } from "react";
import { Layout, Form, FormLayout, TextField, AlphaCard, VerticalStack, Button, SkeletonBodyText } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [scriptValue, setScriptValue] = useState("");
  const fetch = useAuthenticatedFetch();

  //Getting the script value from the initial load
  useEffect(async () => {
    setIsLoading(true);
    const reponse = await fetch("/api/script/get");
    if (reponse.ok) {
      reponse.json().then((data) => {
        setScriptValue(data.script);
        setIsLoading(false);
      });
    }
    else {
      setIsLoading(false);
    }
  }, []);


  const handleSubmit = async () => {
    setIsLoading(true);
    const response = await fetch("/api/script/add", {
      method: "POST",
      body: JSON.stringify({ script: scriptValue }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      setIsLoading(false);
    }
    else {
      setIsLoading(false);
    }

  };

  const handleChange = useCallback(
    (newValue) => setScriptValue(newValue),
    [],
  );

  return (
    <Layout.Section>
      <AlphaCard>
        {isLoading ?
          <SkeletonBodyText lines={4} />
          :
          <>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  label="Order Page Script"
                  onChange={handleChange}
                  value={scriptValue}
                  autoComplete="off"
                  placeholder="https://example.com/script.js"
                />
                <VerticalStack inlineAlign="end">
                  <Button submit primary>Save 1</Button>
                </VerticalStack>
              </FormLayout>
            </Form>
          </>
        }

      </AlphaCard>
    </Layout.Section>
  );
}
