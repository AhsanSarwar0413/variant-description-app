import { useState } from 'react';
import {
  Page,
  Layout,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import ProductSelection from "../components/ProductSelection";

export default function HomePage() {

  const [shop, setShop] = useState(null);

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar
          title="Variant Description" primaryAction={{
            content: 'Contact Us',
            onAction: () => console.log('action clicked'),
          }}
        />
        <Layout>
          <Layout.Section>
            <ProductSelection shop={shop} />
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
