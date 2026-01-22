import express, {Request, Response} from "express";

const app = express();

type ProductSearchData = {
    code:string,
    product_name:string
}

type SearchData = {
    count:number,
    page:number,
    page_count:number,
    page_size:number,
    products:ProductSearchData[],
    skip:number
}

async function getSearchData(searchKey:string) {
    const req = await fetch(`https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${searchKey}&page_size=5&fields=product_name,code`)
    const data = (await req.json()) as SearchData;
    return data;
}

async function getProductData(productCode:string) {
    const req = await fetch(`https://world.openfoodfacts.net/api/v2/product/${productCode}.json?lc=en`);
    const data = await req.json();
    return data;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req:Request, res:Response) =>{
    res.render("index");
});

app.post("/search",async (req:Request, res:Response) =>{
    let searchKeyLiteral:string = req.body.searchKey.trim();
    const searchKey = encodeURIComponent(searchKeyLiteral);
    const searchData = await getSearchData(searchKey);
    
    res.render("search-results", {
        data: searchData,
        searchKeyLiteral: searchKeyLiteral
    });
});

app.post("/product",async (req:Request, res:Response) =>{
    const productCode:string = req.body.productCode;
    const productData = (await getProductData(productCode));
    
    res.render("product", {
        product: productData.product
    });
    //res.send(JSON.stringify(productData));
});

app.listen(3000);