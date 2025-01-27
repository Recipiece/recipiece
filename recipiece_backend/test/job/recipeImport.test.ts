import { User, prisma } from "@recipiece/database";
import archiver from "archiver";
import { Job } from "bullmq";
import { createWriteStream, mkdirSync, rmSync } from "fs";
import fetch from "jest-fetch-mock";
import { DateTime } from "luxon";
import path from "path";
import { gzipSync } from "zlib";
import { importRecipes } from "../../src/job/processors/recipeImports";
import { RecipeImportFiles } from "../../src/util/constant";

describe("Import Recipes", () => {
  describe("From Paprika", () => {
    const rawPaprikaRecipe01 = {
      rating: 5,
      notes: "",
      directions: "",
      categories: ["Beef", "Dinner", "Mexican"],
      servings: "",
      nutritional_info: "",
      uid: "3C1A74B0-F910-4450-A677-F04B2E8513DD-9079-000026018BCF2269",
      photo_hash: null,
      photo_large: null,
      difficulty: "",
      description: "",
      created: "2021-01-06 21:03:01",
      cook_time: "",
      prep_time: "",
      photo: null,
      photos: [],
      source_url: "",
      hash: "AE7A33C8CD0AEA496043B2F51B4DE5DF8B3E6D87C57913798C725B67E7DDADF2",
      source: "",
      image_url: null,
      photo_data: null,
      total_time: "",
      ingredients: "1 pound ground beef\n" + "½ onion\n" + "1 bell pepper\n" + "4 oz green chile\n" + "2 cloves garlic\n" + "spices\n" + "4 flour tortillas ",
      name: "Beef Burritos",
    };

    const rawPaprikaRecipe02 = {
      rating: 0,
      notes: "",
      directions:
        "Heat the oven to 350 degrees. Butter a 13-by-9-inch baking dish. In a medium bowl, combine the flour, 1 cup/200 grams of the brown sugar, oats, pecans and salt. Add the butter, and stir with a fork until the crumbs are evenly moistened.\n" +
        "\n" +
        "Add the apples to the buttered baking dish and toss with the remaining 1/2 cup/100 grams brown sugar, cinnamon and lemon juice. Spread the apples into an even layer. Press the crumb mixture together to create clumps of different sizes, and sprinkle on top of the apples. Transfer to the oven, and bake until the apples are tender and the crumb topping is crisp and deep golden brown, about 50 to 60 minutes. Serve warm or at room temperature.",
      categories: ["Desserts"],
      servings: "8 to 10 servings",
      nutritional_info:
        "Trans Fat: 0 grams\n" +
        "Fat: 23 grams\n" +
        "Calories: 504\n" +
        "Saturated Fat: 9 grams\n" +
        "Unsaturated Fat: 12 grams\n" +
        "Sodium: 201 milligrams\n" +
        "Sugar: 45 grams\n" +
        "Fiber: 7 grams\n" +
        "Carbohydrate: 73 grams\n" +
        "Protein: 5 grams",
      uid: "986D8E45-173C-438F-B76F-67C10D177576",
      photo_hash: "D8D54535DFED964A477420367674648CC13ABA7A3F83D1E0DAFDB2843C794824",
      photo_large: null,
      difficulty: "",
      description: "",
      created: "2024-09-06 21:14:22",
      cook_time: "",
      prep_time: "",
      photo: "50AB0A91-127E-46DB-9D31-2233CF1DC5B2.jpg",
      photos: [],
      source_url: "https://cooking.nytimes.com/recipes/1018638-apple-crumble",
      hash: "24B5115609295BF99DC4920B25AC23DD44F439959FD859E485BCB925ECCF0444",
      source: "cooking.nytimes.com",
      image_url: "https://static01.nyt.com/images/2018/10/18/dining/27COOKING-APPLE-CRUMB-ICECREAM1/27COOKING-APPLE-CRUMB-ICECREAM1-square640-v2.jpg",
      photo_data: "big_ol_blob_of_data===",
      total_time: "1 hr 10 min",
      ingredients:
        "12 tablespoons/170 grams unsalted butter, melted, plus more for buttering the pan\n" +
        "1 1/2 cups/180 grams all-purpose flour\n" +
        "1 1/2 cup/300 grams packed dark brown sugar, divided\n" +
        "1 cup/80 grams old-fashioned rolled oats\n" +
        "1 cup/113 grams pecans, chopped\n" +
        "1 teaspoon kosher salt\n" +
        "3 1/2 pounds mixed apples, such as Granny Smith, Macintosh, and Pink Lady, peeled, cored, and cut into 1/2-inch wedges (about 8 medium apples)\n" +
        "1 tablespoon ground cinnamon\n" +
        "2 tablespoons fresh lemon juice",
      name: "Apple Crumble",
    };

    let seed: string;
    let user: User;

    beforeEach(async () => {
      [user] = await fixtures.createUserAndToken();
    });

    beforeEach(async () => {
      seed = DateTime.utc().toISO();
      // this is where we'll place the .paprikarecipes file that we generate
      mkdirSync(path.resolve(__dirname, `./tmp/${seed}/${user.id}`), { recursive: true });

      const gzipped01 = gzipSync(Buffer.from(JSON.stringify(rawPaprikaRecipe01)));
      const gzipped02 = gzipSync(Buffer.from(JSON.stringify(rawPaprikaRecipe02)));

      const output = createWriteStream(path.resolve(__dirname, `./tmp/${seed}/${user.id}/test_data.paprikarecipes`));
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });
      archive.pipe(output);
      archive.append(gzipped01, { name: `${rawPaprikaRecipe01.name}.paprikarecipe` });
      archive.append(gzipped02, { name: `${rawPaprikaRecipe02.name}.paprikarecipe` });
      await archive.finalize();
    });

    beforeEach(() => {
      // patch up the constants to point to the right file
      jest.replaceProperty(RecipeImportFiles, "TMP_DIR", path.resolve(__dirname, `./tmp/${seed}`) as typeof RecipeImportFiles.TMP_DIR);
      fetch.doMock();
    });

    afterEach(() => {
      // cleanup the tmp dir
      rmSync(path.resolve(__dirname, "./tmp"), {
        recursive: true,
        force: true,
      });
    });

    afterEach(() => {
      // restore the mocks
      jest.restoreAllMocks();
    });

    it("should parse the recipes", async () => {
      fetch.mockIf(`${process.env.APP_RECIPE_PARSER_SERVICE_URL!}/ingredients/parse`, async () => {
        return JSON.stringify({
          ingredients: [],
        });
      });

      const job = {
        data: {
          file_name: path.resolve(__dirname, `${RecipeImportFiles.TMP_DIR}/${user.id}/test_data.paprikarecipes`),
          user_id: user.id,
          source: "paprika",
        },
      };
      await importRecipes(job as Job);

      const firstCreatedRecipe = await prisma.recipe.findFirst({
        where: {
          name: rawPaprikaRecipe01.name,
        },
      });
      expect(firstCreatedRecipe).toBeTruthy();
      expect(firstCreatedRecipe!.user_id).toBe(user.id);
      expect(firstCreatedRecipe!.description).toBe(rawPaprikaRecipe01.description);

      const secondCreatedRecipe = await prisma.recipe.findFirst({
        where: {
          name: rawPaprikaRecipe02.name,
        },
      });
      expect(secondCreatedRecipe).toBeTruthy();
      expect(secondCreatedRecipe!.user_id).toBe(user.id);
      expect(secondCreatedRecipe!.description).toBe(rawPaprikaRecipe02.description);
    });
  });
});
