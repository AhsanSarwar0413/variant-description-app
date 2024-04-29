import React, { useState, useEffect, useRef } from "react";
import { Button, VerticalStack, Toast } from "@shopify/polaris";
import Trix from 'trix';
import { useAuthenticatedFetch } from "../hooks";

function DescriptionEditor({ variantData }) {
    const trixInput = useRef(null);
    const [descriptionText, setDescriptionText] = useState(variantData?.variantDescription ?? '');
    const [shop, setShop] = useState(null);
    const [toastActive, setToastActive] = useState(false);
    const [toastError, setToastError] = useState({
        active: false,
        message: '',

    });

    const customFetch = useAuthenticatedFetch();

    useEffect(() => {
        const trixChangeHandler = (event) => {
            console.log("Inner HTML :", event.target.innerHTML);
            setDescriptionText(event.target.innerHTML);
        };

        if (trixInput.current) {
            trixInput.current.addEventListener("trix-change", trixChangeHandler);
        }

        return () => {
            if (trixInput.current) {
                trixInput.current.removeEventListener("trix-change", trixChangeHandler);
            }
        };
    }, [trixInput]);

    useEffect(() => {
        const fetchShopData = async () => {
            const response = await customFetch('/api/shop');
            const data = await response.json();
            setShop(data);
        };
        fetchShopData();
    }, []);

    const handleSave = async (variantData) => {
        const shopDomain = shop.data[0].myshopify_domain;
        const response = await customFetch(`/api/variant/add?host=${shopDomain}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variantData: variantData,
                variantId: variantData?.id ?? '0',
                description: descriptionText
            }),
        });
        if (response.ok) {
            setToastActive(true);
        } else {
            setToastError({
                active: true,
                message: response,
            });
        }
    }
    return (
        <>
            <input
                type="hidden"
                id={`trix-${variantData.id}`}
                value={descriptionText}
            />
            <trix-editor input={`trix-${variantData.id}`} style={{ minHeight: '250px', overflowY: 'auto' }} ref={trixInput} />
            <VerticalStack inlineAlign="end">
                <Button primary onClick={() => handleSave(variantData)}>Save</Button>
            </VerticalStack>
            {toastActive && <Toast content="Description Saved" onDismiss={() => setToastActive(false)} />}
            {toastError.active && <Toast content={toastError.message} error onDismiss={() => setToastError({ active: false, message: '' })} />}
        </>
    );
}

export default DescriptionEditor;