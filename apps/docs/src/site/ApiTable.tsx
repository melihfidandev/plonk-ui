import { API } from "@/content/api";
import api from "@/generated/api.json";

type ApiProp = {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  inherited: boolean;
};

/**
 * Bir bileşenin prop tablosu. Tipler ve varsayılanlar koddan üretilen
 * api.json'dan, açıklamalar src/content/api.ts'ten gelir.
 */
export function ApiTable({ component }: { component: string }) {
  const props = (api as Record<string, ApiProp[]>)[component];
  if (!props) throw new Error(`ApiTable: unknown component "${component}"`);
  const descriptions = API[component]?.props ?? {};

  return (
    <div className="site-api">
      <table>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <td>
                <code>{prop.name}</code>
                {prop.required && (
                  <span className="req" title="Required">
                    *
                  </span>
                )}
              </td>
              <td className="type" data-label="Type">
                <code>{prop.type}</code>
              </td>
              <td className="default" data-label="Default">
                {prop.default ? <code>{prop.default}</code> : "—"}
              </td>
              <td className="description">
                <Markdownish text={descriptions[prop.name] ?? ""} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Açıklamalardaki `kod` parçaları için yeterli, küçük bir dönüştürücü. */
function Markdownish({ text }: { text: string }) {
  return text
    .split(/(`[^`]+`)/)
    .map((part, i) =>
      part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part,
    );
}
