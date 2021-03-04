/* eslint-disable */
import React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ComparisonModal from './comparisonModal.jsx';
import CardContainer from '../sharedStyledComponents/cardContainer.js';

class RelatedProductCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productIDInfo: '',
      parentProductIDInfo: this.props.parentProductIDInfo,
      productIDStyles: '',
      featuredURL: '',
      loaded: 0,
      openCompareModal: false,
      combinedFeatures: '',
      salePrice: ''
    }
    // bind functions here
    this.handleCompareClick = this.handleCompareClick.bind(this);
    this.combineFeatures = this.combineFeatures.bind(this);

    this.ImageWrapper = styled.div`
    height: 200px;
    width: auto;
    margin-bottom: 30px;
  `;
    this.Image = styled.img`
    height: 100%;
    width: 100%;
    object-fit: contain;
    z-index: 0;
  `;
  }

  componentDidMount() {
    axios.get(`/products/?product_id=${this.props.productID}`)
      .then(({ data })=> {
        this.setState({
          productIDInfo: data,
          parentProductFeatures: this.props.parentProductIDInfo.features,
          currentProductFeatures: data.features,
          loaded: this.state.loaded + 1
        })
      })
    axios.get(`/products/?product_id=${this.props.productID}&flag=styles`)
      .then(({ data })=> {
        const defaultProduct = data.results.find((product)=> {
          return product["default?"] === true
        })
        if (!defaultProduct) {
          var url = data.results[0].photos[0].url;
          this.setState({
            salePrice: data.results[0]["sale_price"]
          })
        } else {
          url = defaultProduct.photos[0].url;
          this.setState({
            salePrice: defaultProduct["sale_price"]
          })
        }
        if (!url) {
          this.setState({
            productIDStyles: data,
            loaded: this.state.loaded + 1,
            featuredURL: "https://www.westernheights.k12.ok.us/wp-content/uploads/2020/01/No-Photo-Available.jpg",
          })
        } else {
          this.setState({
            productIDStyles: data,
            loaded: this.state.loaded + 1,
            featuredURL: url
          })
        }
      })

      // testing cart api
      // axios.post('/cart', {
      //   sku_id: 420346
      // })
      //   .then(({ data }) => {
      //     console.log('this is data', data);
      //   });
  }

  combineFeatures (parentProduct, currentProduct) {
    // goal is to get features into an array so we can map over it in comparisonModal

    const combinedFeatures = {};

    parentProduct.forEach((product)=>{
      if(!combinedFeatures[product.feature]) {
        if (product.value === null) {
          combinedFeatures[product.feature] = ['✔️'];
        } else {
          combinedFeatures[product.feature] = [product.value]
        }
      }
    })

    currentProduct.forEach((product)=> {
      if (!combinedFeatures[product.feature]) {
        if (product.value === null) {
          combinedFeatures[product.feature] = [];
          combinedFeatures[product.feature][1] = '✔️';
        } else {
          combinedFeatures[product.feature] = [];
          combinedFeatures[product.feature][1] = product.value;
        }
      } else {
        if (product.value === null) {
          combinedFeatures[product.feature][1] = '✔️'
        } else {
          combinedFeatures[product.feature][1] = product.value;
        }
      }
    })

    const arrayOfCombinedFeatures = [];
    const features = Object.keys(combinedFeatures);
    const values = Object.values(combinedFeatures);

    for (let p = 0; p < features.length; p++) {
      arrayOfCombinedFeatures.push(values[p][0], features[p], values[p][1]);
    }

    this.setState({
      combinedFeatures: arrayOfCombinedFeatures
    })
  };

  handleCompareClick(event) {
    this.setState({
      openCompareModal: !this.state.openCompareModal
    })
    this.combineFeatures(this.state.parentProductFeatures, this.state.currentProductFeatures)
  }

  render() {
    var sale = {
      textDecoration: this.state.salePrice ? 'line-through' : 'none',
      color: this.state.salePrice ? 'red' : 'black'
    }
    return (
      <div>
        {
          this.state.loaded < 2 &&
          <img src="https://www.bluechipexterminating.com/wp-content/uploads/2020/02/loading-gif-png-5.gif" width="300"></img>
        }
        {
          this.state.loaded === 2 &&
          <CardContainer>
              <ButtonWrapper>
              <CompareButton
                onClick={this.handleCompareClick}
              >&#9734;</CompareButton>
              </ButtonWrapper>

            <this.ImageWrapper>
              <this.Image src={this.state.featuredURL} width="100%" height="auto"></this.Image>
            </this.ImageWrapper>

            <ProductContentWrapper>{this.state.productIDInfo.category}</ProductContentWrapper>
            <ProductContentWrapper>{this.state.productIDInfo.name}</ProductContentWrapper>
            <ProductContentWrapper style={sale}>${this.state.productIDInfo.default_price}</ProductContentWrapper>
            {this.state.salePrice ? <ProductContentWrapper>{this.state.salePrice}</ProductContentWrapper> : null}
          </CardContainer>
        }
        {
          this.state.openCompareModal &&
          <div>
              <ComparisonModal
            closeModal={this.handleCompareClick}
            productFeatures={this.state.compareProductsFeatures}
            parentProduct={this.state.parentProductIDInfo.name}
            compareProduct={this.state.productIDInfo.name}
            combinedFeatures={this.state.combinedFeatures}
            />
          </div>
        }
      </div>
    );
  }
}

const CompareButton = styled.button`
  right: 20%;
  top: 2%;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 25px;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 1;
`;

const ProductContentWrapper = styled.div`
  margin: 3px 3px 3px 5px;
`;

export default RelatedProductCard;
