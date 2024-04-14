import {
  Page,
  Layout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import ProductSelection from "../components/ProductSelection";

export default function HomePage() {
  return (
    <Page fullWidth>
      <TitleBar
        title="Variant Description" primaryAction={{
          content: 'Contact Us',
          onAction: () => console.log('action clicked'),
        }}
      />
      <Layout>
        <Layout.Section>
          <ProductSelection />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
