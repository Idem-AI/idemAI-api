import { ChatHistoryItemModel } from "../chatHistortyItem.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder for ChatHistoryItemModel
 */
export class ChatHistoryItemBuilder {
  
  /**
   * Creates an empty ChatHistoryItemModel with all required properties
   */
  static createEmpty(): ChatHistoryItemModel {
    return {
      id: uuidv4(),
      message: "",
      role: "user",
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates a partial ChatHistoryItemModel with specified properties
   */
  static createPartial(data: Partial<ChatHistoryItemModel>): ChatHistoryItemModel {
    return { ...this.createEmpty(), ...data };
  }
}
