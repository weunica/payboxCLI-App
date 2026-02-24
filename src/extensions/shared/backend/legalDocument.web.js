import { webMethod } from "@wix/web-methods";
import { items, permissions } from "@wix/data";

const collectionId = "@payboxapp/qr-script/legal-terms";


// Web method לקריאת המסמך האחרון
export const getLegalDocument = webMethod(
 permissions.Anyone,
  async () => {
    const result = await items
      .query(collectionId)
      .descending("_createdDate")
      .limit(1)
      .find();

    return result.items[0] || null;
  }
);

// Web method לשמירה / עדכון המסמך
export const saveLegalDocument = webMethod(
  permissions.Anyone,
  async (data) => {
    const result = await items
      .query(collectionId)
      .descending("_createdDate")
      .limit(1)
      .find();

    if (result.items.length > 0) {
      const existing = result.items[0];

      return await items.update(collectionId, {
        ...existing,
        ...data,
        _id: existing._id,
      });
    }

    // אם לא נמצא מסמך — יצירה
    return await items.insert(collectionId, data);
  }
);
